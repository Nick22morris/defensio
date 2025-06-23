import React, { useState, useEffect } from 'react';
import CellComponent from './cell';
import '../App.css';
import '../css/hierarchy-navigator.css';
import { fetchAndBuildTree } from '../accessFiles';

// Initialize a global BroadcastChannel
const channel = new BroadcastChannel('node-updates');

const HierarchyNavigator = ({ onNodeChange }) => {
  const [currentNode, setCurrentNode] = useState(null);
  const [rootNode, setRootNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flatNodes, setFlatNodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const flattenTree = (node) => {
    const all = [node];
    if (node.children) {
      node.children.forEach((child) => {
        all.push(...flattenTree(child));
      });
    }
    return all;
  };

  useEffect(() => {
    let isMounted = true; // To prevent state updates if the component unmounts

    const fetchRootNode = async () => {
      try {
        const rootNode = await fetchAndBuildTree(); // Assuming 'root' is the ID for the root node
        if (isMounted) {
          setCurrentNode(rootNode);
          setRootNode(rootNode);
          setFlatNodes(flattenTree(rootNode));
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
    if (childNode.children?.length > 0 || childNode.children_order?.length > 0) {
      setSearchQuery('');
      const childWithChildren = {
        ...childNode,
        children: childNode.children_order?.map(id =>
          flatNodes.find(n => n.id === id)).filter(Boolean)
      };
      setHistory([...history, currentNode]);
      setBreadcrumbs([...breadcrumbs, currentNode]);
      setCurrentNode(childWithChildren);
      setSelectedNode(null);
      onNodeChange(childWithChildren);
      sendNodeToViewer(childWithChildren);
    } else {
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
      setBreadcrumbs(breadcrumbs.slice(0, -1));
      setSelectedNode(null); // Clear selection when navigating back
      onNodeChange(previousNode);
      sendNodeToViewer(previousNode);
    }
  };

  const handleHomeClick = () => {
    setSearchQuery('');
    setHistory([]);
    setBreadcrumbs([]);
    setCurrentNode(rootNode);
    setSelectedNode(null);
    onNodeChange(rootNode);
    sendNodeToViewer(rootNode);
  };

  const handleBreadcrumbClick = (node, index) => {
    setCurrentNode(node);
    setHistory(history.slice(0, index));
    setBreadcrumbs(breadcrumbs.slice(0, index));
    setSelectedNode(null);
    onNodeChange(node);
    sendNodeToViewer(node);
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

  const nodesToDisplay = (searchQuery ? flatNodes : currentNode?.children || []).filter((childNode) => {
    if (childNode.visible === false) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      childNode.title?.toLowerCase().includes(q) ||
      childNode.notes?.toLowerCase().includes(q) ||
      childNode.body?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="navigator-container">
      {breadcrumbs.length > 0 && currentNode && (
        <div className="breadcrumbs">
          <span className="breadcrumb-link" onClick={handleHomeClick}>Home</span>
          {breadcrumbs
            .filter((node, index, arr) => !(index === 0 && node.title === 'Home'))
            .map((node, index) => (
              <React.Fragment key={node.id}>
                <span className="breadcrumb-separator">➔</span>
                <span
                  className="breadcrumb-link"
                  onClick={() => handleBreadcrumbClick(node, index + 1)}
                >
                  {node.title}
                </span>
              </React.Fragment>
            ))}
          <span className="breadcrumb-separator">➔</span>
          <span className="breadcrumb-current">{currentNode.title}</span>
        </div>
      )}

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

      <div >
        <input
          type="text"
          className="hq-search-input"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={handleHomeClick} className="back-button">
            Home
          </button>
        )}
      </div>

      {/* Node List or Single View */}
      <div className="navigator-content">
        {nodesToDisplay.length > 0 ? (
          <div className="child-list">
            {nodesToDisplay.map((childNode) => (
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
        ) : searchQuery ? (
          <div className="expanded-single-view">
            <h3 className="expanded-title">Nothing Found</h3>
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