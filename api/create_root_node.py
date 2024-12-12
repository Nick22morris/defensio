from google.cloud import firestore

# Initialize Firestore client
db = firestore.Client()


def update_children_references():
    nodes_ref = db.collection("nodes")
    nodes = nodes_ref.stream()

    # Create a dictionary to hold all nodes by their IDs
    node_dict = {}
    for node in nodes:
        node_dict[node.id] = node.to_dict()

    # Iterate through all nodes to update parents
    for node_id, node_data in node_dict.items():
        parent_id = node_data.get("parent_id")
        if parent_id:
            # Get the parent's data
            parent_data = node_dict.get(parent_id)
            if parent_data:
                # Ensure the parent has a 'children_order' field
                if "children_order" not in parent_data:
                    parent_data["children_order"] = []

                # If this child is not in the parent's children_order, add it
                if node_id not in parent_data["children_order"]:
                    parent_data["children_order"].append(node_id)

                # Update the parent's children_order in Firestore
                parent_ref = nodes_ref.document(parent_id)
                parent_ref.update(
                    {"children_order": parent_data["children_order"]})
                print(f"Updated parent {parent_id} with child {node_id}")
            else:
                print(
                    f"Parent {parent_id} for child {node_id} does not exist in the database.")
        else:
            print(f"Node {node_id} has no parent.")


if __name__ == "__main__":
    update_children_references()
