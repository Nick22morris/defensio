import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import CellComponent from './cell';
import '../App.css';
import '../css/hierarchy-navigator.css';

const fetchNode = async (id) => {
  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/node/${id}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const HierarchyNavigator = ({ onNodeChange }) => {
  const [currentNodeId, setCurrentNodeId] = useState('root');
  const [history, setHistory] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null); // Track the selected node
  const channel = new BroadcastChannel('node-updates');

  const { data: currentNode, error, isLoading } = useQuery({
    queryKey: ['node', currentNodeId],
    queryFn: () => fetchNode(currentNodeId),
  });

  useEffect(() => {
    if (currentNode) {
      onNodeChange(currentNode); // Notify parent component about the current node
      sendNodeToViewer(currentNode); // Send current node to the display view
    }
  }, [currentNode, onNodeChange]);

  const handleCellClick = (childNode) => {
    if (selectedNode === childNode.id) {
      // If the clicked node is already selected, unselect it
      setSelectedNode(null);
      onNodeChange(currentNode); // Reset notes to the current parent node
      sendNodeToViewer(currentNode); // Reset display view to the parent node
    } else if (childNode.children?.length > 0) {
      // Navigate deeper if the node has children
      setHistory([...history, currentNodeId]);
      setCurrentNodeId(childNode.id);
      setSelectedNode(null); // Clear selection when navigating
      onNodeChange(childNode); // Update parent with the clicked node
      sendNodeToViewer(childNode); // Update display view
    } else {
      // Highlight the node if it has no children
      setSelectedNode(childNode.id);
      onNodeChange(childNode); // Update parent with the selected node
      sendNodeToViewer(childNode); // Update display view
    }
  };

  const handleBackClick = () => {
    if (history.length > 0) {
      const previousNodeId = history[history.length - 1];
      setCurrentNodeId(previousNodeId);
      setHistory(history.slice(0, -1));
      setSelectedNode(null); // Clear selection when navigating back
      onNodeChange(currentNode); // Update parent with the parent node
      sendNodeToViewer(currentNode); // Update display view
    }
  };

  const sendNodeToViewer = (node) => {
    if (node) {
      channel.postMessage({ type: 'update', node });
    }
  };

  useEffect(() => {
    return () => {
      channel.close();
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="navigator-container">
      {/* Back Button */}
      {history.length > 0 && (
        <button onClick={handleBackClick} className="back-button">
          Back
        </button>
      )}

      {/* Open Viewer Tab Button: Only visible at root */}
      {history.length === 0 && (
        <button
          onClick={() => {
            const viewerTab = window.open('/display', '_blank');
            if (currentNode) sendNodeToViewer(currentNode); // Send current node to the viewer tab
          }}
          className="viewer-tab-button"
        >
          Open Viewer Tab
        </button>
      )}

      {/* Children Display */}
      <div className="navigator-content">
        {currentNode?.children?.length > 0 ? (
          <div className="child-list">
            {currentNode.children.map((childNode) => (
              <CellComponent
                key={childNode.id}
                title={childNode.title}
                notes={childNode.notes || ''}
                onClick={() => handleCellClick(childNode)}
                hasChildren={childNode.children && childNode.children.length > 0}
                isSelected={selectedNode === childNode.id} // Pass selected state
              />
            ))}
          </div>
        ) : (
          <div className="expanded-single-view">
            <h3 className="expanded-title">{currentNode.title}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyNavigator;