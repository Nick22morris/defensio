import React, { useState, useEffect } from 'react';
import '.././App.css';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import GuidelineViewer from './guidelineView';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
    console.error('Error updating node:', error);
    throw new Error(`Failed to update node: ${error.message}`);
  }
};

const addChildNode = async (parentId, childNode) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/node/${parentId}/add-child`, childNode);
    return response.data;
  } catch (error) {
    console.error('Error adding child node:', error);
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
    console.error('Error removing child node:', error);
    throw new Error('Failed to remove child node');
  }
};
const SaveMessage = () => {
  return (
    <div className="save-message">
      <p>Content Saved</p>
    </div>
  );
};
const NodeEditor = () => {
  const navigate = useNavigate();
  const [rootNode, setRootNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState('');

  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // State for resizable panels
  const [treeWidth, setTreeWidth] = useState(550); // Initial width of hierarchy tree
  const [isResizing, setIsResizing] = useState(false); // Track if resizing is active

  useEffect(() => {
    // Fetch the root node when the component mounts
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Command+S or Ctrl+S
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault(); // Prevent default browser behavior
        handleSave(); // Trigger save functionality
      }
    };

    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNode, title, body, notes]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedChildren = Array.from(selectedNode.children);
    const [movedItem] = reorderedChildren.splice(result.source.index, 1);
    reorderedChildren.splice(result.destination.index, 0, movedItem);


    const newOrder = reorderedChildren.map((child) => child.id);

    try {
      // Update the order on the server
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/node/${selectedNode.id}/update-order`, {
        order: newOrder,
      });

      // Update the local state
      setSelectedNode((prev) => ({
        ...prev,
        children: reorderedChildren,
      }));
    } catch (error) {
      console.error("Failed to update child order:", error);
    }
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    setTitle(node.title);
    setBody(node.body || '');
    setNotes(node.notes || '');
  };

  const handleSave = async () => {
    if (!selectedNode) return;

    const updates = { title, body, notes, children: selectedNode.children };

    try {
      // Save updates to the selected node, including the new order of children
      await updateNodeProperty(selectedNode.id, updates);


      // Fetch the updated hierarchy from the server
      const updatedRootNode = await fetchNode("root");

      // Update the root node state
      setRootNode(updatedRootNode);

      // Find and set the updated selected node
      const findUpdatedNode = (node, id) => {
        if (node.id === id) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findUpdatedNode(child, id);
            if (found) return found;
          }
        }
        return null;
      };

      const newSelectedNode = findUpdatedNode(updatedRootNode, selectedNode.id);
      setSelectedNode(newSelectedNode || updatedRootNode);
      // Display the save message
      setShowSaveMessage(true);

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowSaveMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
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

  // Handle resizing
  const handleMouseDown = () => {
    setIsResizing(true);
    document.body.style.userSelect = 'none'; // Disable text selection
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.userSelect = ''; // Re-enable text selection
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    setTreeWidth(Math.max(200, e.clientX)); // Ensure a minimum width of 200px
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const renderHierarchy = (node, level = 0) => (
    <div className="tree-node" key={node.id} style={{ paddingLeft: `${level * 20}px` }}>
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
      <div className="top-header">
        <GuidelineViewer />
      </div>
      <div className="main-content">
        <div
          className="hierarchy-tree"
          style={{
            flex: `0 0 ${treeWidth}px`,
            maxWidth: `${treeWidth}px`,
            minWidth: '200px',
          }}
        >
          <h3>Hierarchy</h3>
          <div style={{ overflowX: 'auto' }}>{renderHierarchy(rootNode)}</div>
        </div>
        <div
          className="resizer"
          onMouseDown={handleMouseDown}
          style={{
            width: '10px',
            cursor: 'col-resize',
            backgroundColor: '#ddd',
          }}
        ></div>
        <div className="editor-wrapper">
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
                    toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  }}
                  onEditorChange={(content) => setBody(content)}
                />
              </label>
              <label>
                Notes:
                <Editor
                  apiKey="jyoilj77xozk21jg7wxt1k5t9a0u7nisp896b6lmsyhd826j"
                  value={notes}
                  init={{
                    height: 300,
                    menubar: true,
                    plugins: 'advlist autolink lists link image charmap preview anchor searchreplace code fullscreen table help wordcount',
                    toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  }}
                  onEditorChange={(content) => setNotes(content)}
                />
              </label>
              <button className="icon-button save" onClick={handleSave}>
                Save Changes
              </button>
              <h4>Manage Children</h4>
              <button className="icon-button add" onClick={handleAddChild}>
                Add Child
              </button>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="child-list">
                  {(provided) => (
                    <ul
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="child-list"
                    >
                      {selectedNode?.children?.map((child, index) => (
                        <Draggable
                          key={child.id.toString()}
                          draggableId={child.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="child-item"
                            >
                              {child.title}
                              <button
                                className="icon-button delete"
                                onClick={() => handleRemoveChild(child.id)}
                              >
                                Remove
                              </button>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          ) : (
            <div className="empty-editor">
              <p>Select a node to edit its details here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Save confirmation message */}
      {showSaveMessage && <SaveMessage />}
    </div>
  );
};

export default NodeEditor;