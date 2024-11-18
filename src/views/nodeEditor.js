import React, { useState, useEffect } from 'react';
import '.././App.css';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const fetchNode = async (id) => {
  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/node/${id}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
const updateNodeProperty = async (id, updates) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/node/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error("Error updating node:", error);
    throw new Error(`Failed to update node: ${error.message}`);
  }
};

const addChildNode = async (parentId, childNode) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/node/${parentId}/add-child`, childNode);
    return response.data;
  } catch (error) {
    console.error("Error adding child node:", error);
    throw new Error('Failed to add child node');
  }
};

const removeChildNode = async (parentId, childId) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/node/${parentId}/remove-child`, {
      childId,
    });
    return response.data;
  } catch (error) {
    console.error("Error removing child node:", error);
    throw new Error('Failed to remove child node');
  }
};

const NodeEditor = () => {
  const navigate = useNavigate();
  const [rootNode, setRootNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchNode('root')
      .then((node) => {
        setRootNode(node);
        setSelectedNode(node);
        setTitle(node.title);
        setBody(node.body || '');
        setNotes(node.notes || '');
      })
      .catch(console.error);
  }, []);

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    setTitle(node.title);
    setBody(node.body || '');
    setNotes(node.notes || '');
  };

  const handleSave = async () => {
    if (!selectedNode) return;
    const updates = { title, body, notes };
    await updateNodeProperty(selectedNode.id, updates);
    const updatedNode = await fetchNode('root');
    setRootNode(updatedNode);
  };

  const handleAddChild = async () => {
    if (!selectedNode) return;
    const newChild = {
      title: 'New Child',
      body: '',
      notes: '',
      parent_id: selectedNode.id,
    };
    const addedChild = await addChildNode(selectedNode.id, newChild);
    setSelectedNode((prev) => ({
      ...prev,
      children: [...(prev.children || []), addedChild],
    }));
  };

  const handleRemoveChild = async (childId) => {
    if (!selectedNode) return;
    await removeChildNode(selectedNode.id, childId);
    setSelectedNode((prev) => ({
      ...prev,
      children: prev.children.filter((child) => child.id !== childId),
    }));
  };

  const renderHierarchy = (node, level = 0) => (
    <div className="tree-node" key={node.id}>
      <div
        className={`hierarchy-item ${selectedNode?.id === node.id ? 'selected' : ''}`}
        onClick={() => handleSelectNode(node)}
      >
        {node.title}
      </div>
      {node.children?.length > 0 && (
        <div className="tree-children">
          {node.children.map((child) => renderHierarchy(child, level + 1))}
        </div>
      )}
    </div>
  );

  if (!rootNode) return <div>Loading hierarchy...</div>;

  return (
    <div className="node-editor-container">
      <div className="header">
        <button onClick={() => navigate('/home')} className="home-button">
          Home
        </button>
      </div>
      <div className="hierarchy-tree">
        <h3>Hierarchy</h3>
        <div style={{ overflowX: 'auto' }}>{renderHierarchy(rootNode)}</div>
      </div>
      {selectedNode ? (
        <div className="editor-panel">
          <h3>Edit Node: {selectedNode.title}</h3>
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Body:
            <Editor
              apiKey="jyoilj77xozk21jg7wxt1k5t9a0u7nisp896b6lmsyhd826j"
              value={body}
              init={{
                height: 300,
                menubar: true,
                plugins: 'advlist autolink lists link image charmap preview anchor searchreplace code fullscreen table help wordcount',
                toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
              }}
              onEditorChange={(content) => setBody(content)}
            />
          </label>
          <label>
            Notes:
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <button className="icon-button save" onClick={handleSave}>
            Save Changes
          </button>
          <h4>Manage Children</h4>
          <button className="icon-button add" onClick={handleAddChild}>
            Add Child
          </button>
          <ul>
            {selectedNode.children?.map((child) => (
              <li key={child.id} className="child-item">
                {child.title}
                <button
                  className="icon-button delete"
                  onClick={() => handleRemoveChild(child.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="empty-editor">
          <p>Select a node to edit its details here.</p>
        </div>
      )}
    </div>
  );
};

export default NodeEditor;