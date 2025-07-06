import React, { useState, useEffect } from 'react';
import '.././App.css';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import GuidelineViewer from './guidelineView';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchAndBuildTree } from '../accessFiles';
import { collection, getDocs, getFirestore, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// removed fetchNode in favor of fetchAndBuildTree

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
const LoadingMessage = ({ message }) => {
  return (
    <div className="loading-box">
      <img src="/logo.png" alt="Loading Icon" className="loading-icon" />
      <p className="loading-text">{message}</p>
    </div>
  )
}
const NodeEditor = () => {
  const navigate = useNavigate();
  const [rootNode, setRootNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState('');
  // Reference/copy state
  const [linkTargetId, setLinkTargetId] = useState('');
  // All nodes for link search
  const [allNodes, setAllNodes] = useState([]);

  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState({});

  // Suggestions sidebar state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  // Ensure search input is populated after allNodes is available if the node has an address
  useEffect(() => {
    if (selectedNode?.address && allNodes.length > 0) {
      const target = allNodes.find(n => n.id === selectedNode.address);
      if (target) setLinkTargetId(target.title);
    }
  }, [selectedNode, allNodes]);

  // State for resizable panels
  const [treeWidth, setTreeWidth] = useState(550); // Initial width of hierarchy tree
  const [isResizing, setIsResizing] = useState(false); // Track if resizing is active
  // Fetch suggestions from Firestore on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const suggestionsRef = query(collection(db, 'noteFeedback'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(suggestionsRef);
        const results = snapshot.docs.map(doc => doc.data());
        setSuggestions(results);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };
    fetchSuggestions();
  }, []);

  useEffect(() => {
    // Fetch the root node when the component mounts
    fetchAndBuildTree()
      .then((node) => {
        setRootNode(node);
        setSelectedNode(node);
        setTitle(node.title);
        setBody(node.body || '');
        setNotes(node.notes || '');
        // Flatten all nodes for autocomplete
        const flattenNodes = (n) => {
          const result = [n];
          for (const child of n.children || []) {
            result.push(...flattenNodes(child));
          }
          return result;
        };
        setAllNodes(flattenNodes(node));
      })
      .catch(console.error);
  }, []);

  // Listen for custom event from GuidelineViewer to toggle suggestions
  useEffect(() => {
    const toggleHandler = () => setShowSuggestions(prev => !prev);
    window.addEventListener('toggleSuggestions', toggleHandler);
    return () => window.removeEventListener('toggleSuggestions', toggleHandler);
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
    // If node.address is set, find the corresponding title and set it in linkTargetId
    if (node.address) {
      const target = allNodes.find(n => n.id === node.address);
      setLinkTargetId(target?.title || '');
    } else {
      setLinkTargetId('');
    }

    const nodeElement = document.getElementById(`node-${node.id}`);
    if (nodeElement) {
      nodeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const handleToggleVisibility = async (node) => {
    try {
      const newVisibility = !node.visible;
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/node/${node.id}/toggle-visibility`, {
        visible: newVisibility,
      });
      setSelectedNode({ ...node, visible: newVisibility });
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedNode) return;

    const updates = { title, body, notes, children: selectedNode.children };
    // Reference/copy logic
    const targetNode = allNodes.find(n => n.title === linkTargetId);
    const isLinking = !!targetNode;
    if (isLinking) {
      updates.title = `${targetNode.title} (copy)`;
      updates.address = targetNode.id;
      setTitle(updates.title); // update UI immediately
    } else {
      updates.address = null;
    }

    try {
      setLoading(true);
      // Save updates to the selected node, including the new order of children
      await updateNodeProperty(selectedNode.id, updates);

      // Store the address and title in Firestore
      const docRef = doc(db, 'nodes', selectedNode.id);
      await updateDoc(docRef, {
        address: updates.address || null,
        title: updates.title,
      });

      // Fetch the updated hierarchy from the server
      const updatedRootNode = await fetchAndBuildTree();

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
      setLoading(false);
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
      visible: true,
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
  const handleToggleExpand = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
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

  const renderHierarchy = (node, level = 0) => {
    // Root node is expanded by default; others are collapsed unless toggled
    const isExpanded = expandedNodes[node.id] || (level === 0 && expandedNodes[node.id] !== false);

    return (
      <div
        id={`node-${node.id}`}
        className="tree-node"
        key={node.id}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        <div className="hierarchy-item">
          <span
            onClick={() => handleToggleExpand(node.id)}
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '10px',
            }}
          >
            {node.children?.length > 0 ? (isExpanded ? '-' : '+') : ''}
          </span>
          <span
            onClick={() => handleSelectNode(node)}
            className={`hierarchy-title ${selectedNode?.id === node.id ? 'selected' : ''
              }`}
          >
            {node.address ? node.title.replace(/\s*\(copy\)*$/gi, '') + ' (copy)' : node.title}
          </span>
          {node.visible === false && <span className="hidden-indicator">(Hidden)</span>}
        </div>
        {isExpanded && node.children?.length > 0 && (
          <div className="tree-children">
            {node.children.map((child) => renderHierarchy(child, level + 1))}
          </div>
        )}
      </div>
    );
  };



  if (!rootNode) return <LoadingMessage message="Loading..." />;

  return (
    <div className="node-editor-container">
      <div className="top-header">
        <div className="editor-header-bar">
          <div className="editor-logo">
            <div className="editor-logo-main">Catholic Defense Hub</div>
            <div className="editor-logo-sub">Editor Mode</div>
          </div>
          <div className="editor-controls">
            <GuidelineViewer />
          </div>
        </div>
      </div>

      <div className="main-content">

        {/* Suggestions Sidebar */}
        {showSuggestions && (
          <div className="suggestions-sidebar suggestions-panel slide-in">
            <div className="suggestions-header">
              <h3 className="suggestions-title">Suggestions</h3>
              <button className="close-button" onClick={() => setShowSuggestions(false)}>×</button>
            </div>
            {suggestions.length === 0 ? (
              <p>No suggestions found.</p>
            ) : (
              <ul className="suggestion-list">
                {suggestions.map((s, idx) => (
                  <li key={idx} className="suggestion-item suggestion-card">
                    <div
                      className="suggestion-title"
                      onClick={() => {
                        const findNode = (node, id) => {
                          if (node.id === id) return node;
                          for (const child of node.children || []) {
                            const found = findNode(child, id);
                            if (found) return found;
                          }
                          return null;
                        };
                        const matched = findNode(rootNode, s.nodeId);
                        if (matched) handleSelectNode(matched);
                        setExpandedSuggestion(s);
                      }}
                    >
                      <strong>{s.nodeTitle || 'Untitled Node'}</strong>
                    </div>

                    {expandedSuggestion?.nodeId === s.nodeId && (
                      <div className="suggestion-body-text">
                        <p>{s.feedback}</p>
                        <button
                          className="dismiss-button"
                          onClick={async () => {
                            const snapshot = await getDocs(collection(db, 'noteFeedback'));
                            const match = snapshot.docs.find(
                              d => d.data().nodeId === s.nodeId && d.data().feedback === s.feedback
                            );
                            if (match) await deleteDoc(match.ref);
                            setSuggestions(prev => prev.filter(x => x !== s));
                            setExpandedSuggestion(null);
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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
          {selectedNode ? (() => {
            // Compute isLinking: true if selectedNode.address is set
            const isLinking = !!selectedNode?.address;
            return (
              <div className="editor-panel">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                  <button className="icon-button save" onClick={handleSave}>
                    Save Changes
                  </button>
                </div>
                <h3>Edit Node: {selectedNode.title}</h3>
                <label>
                  Title:
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
                {/* Explanatory text above the search input for referencing */}
                <div style={{ marginTop: '10px', position: 'relative' }}>
                  <p style={{ marginBottom: '4px', color: '#555' }}>
                    Reference another node (search by title):
                  </p>
                  <input
                    type="text"
                    placeholder="Search by title"
                    value={linkTargetId}
                    onChange={(e) => setLinkTargetId(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                  />
                  {linkTargetId && !allNodes.some(n => n.title === linkTargetId) && (
                    <ul style={{ position: 'absolute', top: '100%', backgroundColor: 'white', zIndex: 1000, border: '1px solid #ccc', width: '100%', maxHeight: '150px', overflowY: 'auto' }}>
                      {allNodes
                        .filter(n => n.title.toLowerCase().includes(linkTargetId.toLowerCase()) && n.id !== selectedNode?.id)
                        .slice(0, 10)
                        .map(n => (
                          <li
                            key={n.id}
                            style={{ padding: '5px', cursor: 'pointer' }}
                            onClick={() => {
                              setLinkTargetId(n.title);
                            }}
                          >
                            {n.title}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                {isLinking && (
                  <button
                    className="icon-button delete"
                    onClick={async () => {
                      const docRef = doc(db, 'nodes', selectedNode.id);
                      await updateDoc(docRef, { address: null });
                      setSelectedNode({ ...selectedNode, address: null });
                      setLinkTargetId('');
                    }}
                  >
                    Remove Link
                  </button>
                )}

                {!isLinking && (
                  <>
                    <label>
                      Display:
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

                    <button onClick={() => handleToggleVisibility(selectedNode)} className="icon-button">
                      {selectedNode?.visible ? 'Hide Node' : 'Show Node'}
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
                  </>
                )}
              </div>
            );
          })() : (
            <div className="empty-editor">
              <p>Select a node to edit its details here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Save confirmation message */}
      {showSaveMessage && <SaveMessage />}
      {isLoading && <LoadingMessage message="Saving..." />}
    </div>
  );
};

export default NodeEditor;