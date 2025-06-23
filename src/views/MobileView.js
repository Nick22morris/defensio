import React, { useEffect, useState } from 'react';
import '../css/mobile.css';
import { fetchAndBuildTree } from '../accessFiles';

// Removed fetchNode in favor of fetchAndBuildTree

const MobileView = () => {
    const [currentNode, setCurrentNode] = useState(null);
    const [history, setHistory] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allNodes, setAllNodes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalClosing, setIsModalClosing] = useState(false);

    const flattenTree = (node) => {
        const all = [node];
        if (node.children) {
            node.children.forEach(child => {
                all.push(...flattenTree(child));
            });
        }
        return all;
    };

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const root = await fetchAndBuildTree();
                setCurrentNode(root);
                setAllNodes(flattenTree(root));
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
            setBreadcrumbs([...breadcrumbs, currentNode]);
            setCurrentNode(child);
            setSearchQuery('');
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
            setBreadcrumbs(breadcrumbs.slice(0, -1));
            setSelectedNode(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setSelectedNode(null);
            setIsModalClosing(false);
        }, 300); // Match with CSS duration
    };

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
                <div className="mobile-search">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mobile-search-input"
                    />
                </div>
                {currentNode && currentNode.id !== 'root' && (
                    <div className="mobile-breadcrumbs">
                        <span className="mobile-breadcrumb-link" onClick={() => {
                            setSearchQuery('');
                            setHistory([]);
                            setSelectedNode(null);
                            setBreadcrumbs([]);
                            fetchAndBuildTree().then((root) => {
                                setCurrentNode(root);
                                setAllNodes(flattenTree(root));
                            });
                        }}>Home</span>
                        {breadcrumbs
                            .filter((node, _, arr) => node.title !== 'Home')
                            .map((node, index) => (
                                <React.Fragment key={node.id}>
                                    <span className="mobile-breadcrumb-separator">➔</span>
                                    <span
                                        className="mobile-breadcrumb-link"
                                        onClick={() => {
                                            setCurrentNode(node);
                                            setHistory(history.slice(0, index));
                                            setBreadcrumbs(breadcrumbs.slice(0, index));
                                            setSelectedNode(null);
                                        }}
                                    >
                                        {node.title}
                                    </span>
                                </React.Fragment>
                            ))}
                        <span className="mobile-breadcrumb-separator">➔</span>
                        <span className="mobile-breadcrumb-current">{currentNode.title}</span>
                    </div>
                )}
                <div className="mobile-actions">
                    {currentNode?.notes && (
                        <button onClick={() => setSelectedNode(currentNode)}>Show Notes</button>
                    )}
                </div>
            </header>

            <main className="mobile-main">
                <ul className="mobile-list">
                    {(
                        searchQuery ? allNodes : currentNode?.children || []
                    )
                        .filter(child =>
                            child.visible !== false &&
                            (child.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                child.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                child.body?.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((child) => (
                            <li key={child.id}>
                                <button className="mobile-item" onClick={() => handleChildClick(child)}>
                                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{child.title}</span>
                                        {child.children?.length > 0 && <span style={{ marginLeft: '8px' }}>→</span>}
                                    </span>
                                </button>
                            </li>
                        ))}
                    {(
                        (searchQuery ? allNodes : currentNode?.children || [])
                            .filter(child =>
                                child.visible !== false &&
                                (child.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    child.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    child.body?.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).length === 0
                    ) && (
                            <li style={{ padding: '20px', textAlign: 'center', color: 'white', fontSize: '1.5rem' }}>
                                <i>Nothing Found</i>
                            </li>
                        )}
                </ul>
            </main>

            {selectedNode && (
                <div
                    className={`mobile-modal ${isModalClosing ? 'mobile-modal-exit' : ''}`}
                    onClick={handleCloseModal}
                >
                    <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close-button"
                            onClick={handleCloseModal}
                            aria-label="Close"
                        >
                            &times;
                        </button>
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileView;