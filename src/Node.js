// Node.js
class Node {
    constructor(id, title, body = "", notes = "", children = []) {
      this.id = id;
      this.title = title;
      this.body = body;
      this.notes = notes;
      this.children = children;
    }
  
    static fromObject(data) {
      const { id, title, body, notes, children } = data;
      return new Node(
        id,
        title,
        body,
        notes,
        children ? children.map(Node.fromObject) : []
      );
    }
  }
  
  export default Node;