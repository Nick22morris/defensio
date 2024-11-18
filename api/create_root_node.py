from google.cloud import firestore

# Initialize Firestore
db = firestore.Client()

# Define the root node and hierarchy as nested dictionaries
root_node = {
    "id": "root",
    "title": "Main Category",
    "body": "This is the root node",
    "notes": "Root node for the hierarchy",
    "parent_id": None,
    "children": ["1", "4"]  # List of child node IDs
}

child_nodes = [
    {
        "id": "1",
        "title": "Protestants",
        "body": "Discussing Protestant topics",
        "notes": "Group discussing Protestant topics",
        "parent_id": "root",
        "children": ["2", "3"]
    },
    {
        "id": "2",
        "title": "Worship Mary",
        "body": "",
        "notes": "Discussion on veneration of Mary",
        "parent_id": "1",
        "children": []
    },
    {
        "id": "3",
        "title": "Pope",
        "body": "",
        "notes": "Matthew 16:16 - Pope's significance",
        "parent_id": "1",
        "children": []
    },
    {
        "id": "4",
        "title": "Does God Exist?",
        "body": "",
        "notes": "Philosophical arguments on God's existence",
        "parent_id": "root",
        "children": []
    }
]


def upload_node(node_data):
    """Uploads a single node to Firestore."""
    node_ref = db.collection('nodes').document(node_data['id'])
    node_ref.set(node_data)
    print(f"Node '{node_data['title']}' with ID '{node_data['id']}' uploaded.")


def upload_root_hierarchy():
    """Uploads the root node and all its child nodes to Firestore."""
    # Upload the root node
    upload_node(root_node)

    # Upload each child node
    for child_node in child_nodes:
        upload_node(child_node)

    print("Root node and hierarchy uploaded successfully.")


if __name__ == "__main__":
    upload_root_hierarchy()
