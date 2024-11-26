from flask import Flask, jsonify, request, session
from firebase_admin import auth as firebase_auth, credentials, initialize_app
from google.cloud import firestore
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import timedelta


# Load environment variables from .flaskenv
load_dotenv()
app = Flask(__name__)

SERVICE_ACCOUNT_KEY_PATH = "firebase.json"

# Initialize Firebase Admin SDK
cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
initialize_app(cred)

# Apply CORS settings
CORS(app, resources={
    r"/*": {"origins": [
        "https://defensio-46cf4.web.app",
        "http://localhost:3000",
        "https://flask-backend-572297073167.us-south1.run.app"
    ]}
}, supports_credentials=True)


@app.route('/session-login', methods=['POST'])
def session_login():
    data = request.json
    id_token = data.get('idToken')

    if not id_token:
        return jsonify({"error": "ID token is required"}), 400

    try:
        # Verify the token
        decoded_token = firebase_auth.verify_id_token(id_token)
        return jsonify({"message": "Token is valid", "user": decoded_token}), 200
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401


db = firestore.Client()

# Recursive helper function to fetch children and build the hierarchy


def fetch_children(node_id):
    """Fetch child nodes recursively by parent node's ID and build the hierarchy."""
    children = []
    children_docs = db.collection('nodes').where(
        'parent_id', '==', node_id).stream()
    for doc in children_docs:
        child_data = doc.to_dict()
        # Recursively fetch children for each child node
        child_data['children'] = fetch_children(child_data['id'])
        children.append(child_data)
    return children

# Fetch the root node with its full hierarchy of children


@app.route('/root', methods=['GET'])
def get_root():
    root_doc = db.collection('nodes').document('root').get()
    if root_doc.exists:
        root_data = root_doc.to_dict()
        # Build the full hierarchy starting from the root
        root_data['children'] = fetch_children(root_data['id'])
        return jsonify(root_data), 200
    else:
        return jsonify({"error": "Root node not found"}), 404

# Fetch a specific node and build its hierarchy


@app.route('/node/<id>', methods=['GET', 'POST'])
def handle_node(id):
    if request.method == 'GET':
        try:
            # Fetch the node document from Firestore
            node_doc = db.collection('nodes').document(id).get()
            if node_doc.exists:
                node_data = node_doc.to_dict()
                node_data['children'] = fetch_children(node_data['id'])
                return jsonify(node_data), 200
            else:
                return jsonify({"error": "Node not found"}), 404
        except Exception as e:
            app.logger.error(f"Error fetching node: {e}")
            return jsonify({"error": "Internal server error"}), 500

    if request.method == 'POST':
        try:
            # Validate incoming data
            data = request.json
            if not data:
                return jsonify({"error": "Invalid JSON payload"}), 400

            # Reference the node document
            node_ref = db.collection('nodes').document(id)
            node_doc = node_ref.get()

            if not node_doc.exists:
                return jsonify({"error": "Node not found"}), 404

            # Filter allowed fields for update
            allowed_fields = ['title', 'body', 'notes']
            updates = {key: value for key,
                       value in data.items() if key in allowed_fields}
            if not updates:
                return jsonify({"error": "No valid fields to update"}), 400

            # Update Firestore document
            node_ref.update(updates)
            return jsonify({"message": "Node updated", "updated_data": updates}), 200
        except Exception as e:
            app.logger.error(f"Error updating node {id}: {e}", exc_info=True)
            return jsonify({"error": "Failed to update node"}), 500


@app.route('/node/<id>/add-child', methods=['POST'])
def add_child(id):
    data = request.json
    new_child_id = db.collection('nodes').document().id
    new_child_data = {
        "id": new_child_id,
        "title": data.get('title', 'New Child'),
        "body": data.get('body', ''),
        "notes": data.get('notes', ''),
        "parent_id": id,
        "children": []  # Initialize with an empty children list
    }

    # Store the new child node independently in Firestore
    db.collection('nodes').document(new_child_id).set(new_child_data)

    return jsonify(new_child_data), 200

# Remove a child node from its parent


@app.route('/node/<id>/remove-child', methods=['POST'])
def remove_child(id):
    data = request.json
    child_id = data.get("childId")

    if not child_id:
        return jsonify({"error": "Child ID not provided"}), 400

    # Check if the child node exists
    child_ref = db.collection('nodes').document(child_id)
    child_doc = child_ref.get()
    if not child_doc.exists:
        return jsonify({"error": "Child node not found"}), 404

    try:
        # Remove child ID from parent node's children list
        parent_ref = db.collection('nodes').document(id)
        parent_ref.update({"children": firestore.ArrayRemove([child_id])})

        # Delete the child node document from Firestore
        child_ref.delete()

        return jsonify({"message": "Child removed"}), 200
    except Exception as e:
        print(f"Error removing child: {e}")
        return jsonify({"error": "Failed to remove child"}), 500


@app.route('/test-cors', methods=['GET'])
def test_cors():
    return jsonify({"message": "CORS is working my man!!!"}), 200


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
