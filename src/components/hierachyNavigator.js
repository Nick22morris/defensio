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
const HierarchyNavigator = () => {
  const [currentNodeId, setCurrentNodeId] = useState('root');
  const [history, setHistory] = useState([]);
  const [viewerTab, setViewerTab] = useState(null);
  const channel = new BroadcastChannel('node-updates');

  const { data: currentNode, error, isLoading } = useQuery({
    queryKey: ['node', currentNodeId],
    queryFn: () => fetchNode(currentNodeId),
  });

  useEffect(() => {
    if (currentNode) {
      sendNodeToViewer(currentNode);
    }
  }, [currentNode]);

  const handleCellClick = (childNode) => {
    setHistory([...history, currentNodeId]);
    setCurrentNodeId(childNode.id);
  };

  const handleBackClick = () => {
    if (history.length > 0) {
      const previousNodeId = history[history.length - 1];
      setCurrentNodeId(previousNodeId);
      setHistory(history.slice(0, -1));
    }
  };

  const handleOpenViewerTab = () => {
    if (!viewerTab || viewerTab.closed) {
      const newTab = window.open('/display', '_blank');
      setViewerTab(newTab);
    } else {
      viewerTab.focus();
    }
    if (currentNode) {
      sendNodeToViewer(currentNode);
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
      {history.length > 0 && (
        <button onClick={handleBackClick} className="back-button">
          Back
        </button>
      )}
      <button onClick={handleOpenViewerTab} className="viewer-tab-button">
        Open Viewer Tab
      </button>
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
              />
            ))}
          </div>
        ) : (
          <div className="expanded-single-view">
            <h3 className="expanded-title">{currentNode.title}</h3>
            <p className="expanded-notes">{currentNode.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyNavigator;