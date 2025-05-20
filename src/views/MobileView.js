import React, { useEffect, useState } from 'react';
import '../css/mobile.css';
import { fetchAndBuildTree } from '../accessFiles';

// Removed fetchNode in favor of fetchAndBuildTree

const MobileView = () => {
    const [currentNode, setCurrentNode] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const root = await fetchAndBuildTree();
                setCurrentNode(root);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleChildClick = (child) => {
        if (child.children?.length > 0) {
            setHistory([...history, currentNode]);
            setCurrentNode(child);
            setSelectedNode(null);
        } else {
            setSelectedNode(child);
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setCurrentNode(prev);
            setHistory(history.slice(0, -1));
            setSelectedNode(null);
        }
    };

    const handleCloseModal = () => setSelectedNode(null);

    if (isLoading) {
        return (
            <div className="mobile-launch-screen">
                <img src="/logo2.png" alt="Loading Icon" className="mobile-launch-icon" />
                <h1>Catholic Defense Hub</h1>
            </div>
        );
    }

    return (
        <div className="mobile-container">
            <header className="mobile-header">
                <h1>Catholic Defense Hub</h1>
                <div className="mobile-actions">
                    {history.length > 0 && <button onClick={handleBack}>Back</button>}
                    {currentNode?.notes && (
                        <button onClick={() => setSelectedNode(currentNode)}>Show Notes</button>
                    )}
                </div>
            </header>

            <main className="mobile-main">
                <ul className="mobile-list">
                    {currentNode?.children?.map(
                        (child) =>
                            child.visible !== false && (
                                <li key={child.id}>
                                    <button className="mobile-item" onClick={() => handleChildClick(child)}>
                                        {child.title}
                                    </button>
                                </li>
                            )
                    )}
                </ul>
            </main>

            {selectedNode && (
                <div className="mobile-modal">
                    <div className="mobile-modal-content">
                        <h2>{selectedNode.title}</h2>
                        <div className="mobile-notes">
                            <div dangerouslySetInnerHTML={{ __html: selectedNode.body || '' }} />
                            {selectedNode.notes && (
                                <>
                                    <br />
                                    <strong>Notes:</strong>
                                    <div dangerouslySetInnerHTML={{ __html: selectedNode.notes }} />
                                </>
                            )}
                        </div>
                        <button onClick={handleCloseModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileView;