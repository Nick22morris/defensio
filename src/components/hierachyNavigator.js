import React, { useState, useEffect } from 'react';
import CellComponent from './cell';
import '../App.css';
import '../css/hierarchy-navigator.css';
import { fetchAndBuildTree } from '../accessFiles';

// Initialize a global BroadcastChannel
const channel = new BroadcastChannel('node-updates');

const HierarchyNavigator = ({ onNodeChange }) => {
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // To prevent state updates if the component unmounts

    const fetchRootNode = async () => {
      try {
        const rootNode = await fetchAndBuildTree(); // Assuming 'root' is the ID for the root node
        if (isMounted) {
          setCurrentNode(rootNode);
          setIsLoading(false);

          // Only call `onNodeChange` and `sendNodeToViewer` after state is updated
          onNodeChange(rootNode);
          channel.postMessage({ type: 'update', node: rootNode });
        }
      } catch (err) {
        console.error(err.message);
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    fetchRootNode();

    return () => {
      isMounted = false; // Clean up on unmount
    };
  }, [onNodeChange]);

  const sendNodeToViewer = (node) => {
    if (node) {
      try {
        channel.postMessage({ type: 'update', node });
      } catch (error) {
        console.error('Failed to send node update:', error.message);
      }
    }
  };

  const handleCellClick = (childNode) => {
    if (selectedNode === childNode.id) {
      // Deselect the currently selected node
      setSelectedNode(null);
      onNodeChange(currentNode);
      sendNodeToViewer(currentNode);
    } else if (childNode.children?.length > 0) {
      // Navigate deeper into the hierarchy
      setHistory([...history, currentNode]);
      setCurrentNode(childNode);
      setSelectedNode(null); // Clear any selection when navigating
      onNodeChange(childNode);
      sendNodeToViewer(childNode);
    } else {
      // Highlight the clicked node if it has no children
      setSelectedNode(childNode.id);
      onNodeChange(childNode);
      sendNodeToViewer(childNode);
    }
  };

  const handleBackClick = () => {
    if (history.length > 0) {
      const previousNode = history[history.length - 1];
      setCurrentNode(previousNode);
      setHistory(history.slice(0, -1));
      setSelectedNode(null); // Clear selection when navigating back
      onNodeChange(previousNode);
      sendNodeToViewer(previousNode);
    }
  };

  useEffect(() => {
    // Cleanup should not close the global channel
    return () => {
      // If you need to close this channel, consider managing it separately from the global instance
    };
  }, []);

  if (isLoading) {
    return (
      <div className="hq-loading-spinner">
        <img src="/logo2.png" alt="Loading Icon" className="hq-loading-icon" />
        <p className="hq-loading-text">Fetching Topics...</p>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="navigator-container">
      {/* Back Button */}
      {history.length > 0 && (
        <button onClick={handleBackClick} className="back-button">
          ← Back
        </button>
      )}

      {/* Launch Street Mode Button */}
      {history.length === 0 && (
        <button
          onClick={() => {
            window.open('/display', '_blank');
            if (currentNode) sendNodeToViewer(currentNode);
          }}
          className="back-button"
        >
          Launch Street Mode
        </button>
      )}

      {/* Node List or Single View */}
      <div className="navigator-content">
        {currentNode?.children?.length > 0 ? (
          <div className="child-list">
            {/* Filter out hidden nodes */}
            {currentNode.children
              .filter((childNode) => childNode.visible !== false) // Exclude nodes with visible: false
              .map((childNode) => (
                <CellComponent
                  key={childNode.id}
                  title={childNode.title}
                  notes={childNode.notes || ''}
                  onClick={() => handleCellClick(childNode)}
                  hasChildren={childNode.children && childNode.children.length > 0}
                  isSelected={selectedNode === childNode.id}
                />
              ))}
          </div>
        ) : (
          <div className="expanded-single-view">
            <h3 className="expanded-title">{currentNode.title}</h3>
            {currentNode.notes && (
              <div className="notes-box">
                <p className="notes-content">{currentNode.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyNavigator;