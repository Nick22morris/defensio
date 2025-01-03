from google.cloud import firestore

# Initialize Firestore client
db = firestore.Client()


def set_default_visibility():
    nodes = db.collection('nodes').stream()
    for node in nodes:
        node_ref = db.collection('nodes').document(node.id)
        node_data = node.to_dict()
        if 'visible' not in node_data:
            node_ref.update({"visible": True})


if __name__ == "__main__":
    set_default_visibility()
