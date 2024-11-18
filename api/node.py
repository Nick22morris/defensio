class Node:
    def __init__(self, id: str, title: str, body: str = "", notes: str = "", parent_id: str = None, children=None):
        self.id = id
        self.title = title
        self.body = body
        self.notes = notes
        self.parent_id = parent_id
        # Store children as an array of child IDs
        self.children = children if children is not None else []

    def add_child_id(self, child_id):
        if isinstance(child_id, str):
            self.children.append(child_id)
        else:
            raise TypeError("child_id must be a string")

    def to_dict(self):
        """Convert to dictionary for Firestore storage. Store children as IDs."""
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "notes": self.notes,
            "parent_id": self.parent_id,
            "children": self.children  # Store children as a list of IDs
        }

    @classmethod
    def from_dict(cls, data):
        """Reconstruct Node object from Firestore data."""
        return cls(
            id=data["id"],
            title=data["title"],
            body=data.get("body", ""),
            notes=data.get("notes", ""),
            parent_id=data.get("parent_id"),
            children=data.get("children", [])
        )

    def __repr__(self):
        return f"Node(id='{self.id}', title='{self.title}', children_count={len(self.children)})"
