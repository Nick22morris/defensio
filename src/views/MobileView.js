import React, { useEffect, useState } from 'react';
import '../css/mobile.css';
import { fetchAndBuildPublicTree } from '../accessFiles';

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
    const [feedback, setFeedback] = useState('');
    const [showSuggestionInput, setShowSuggestionInput] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null); // 'success' | 'error'

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
                const root = await fetchAndBuildPublicTree();

                const resolvedMap = {};
                const resolveNode = (node) => {
                    if (node.address && resolvedMap[node.address]) {
                        return { ...resolvedMap[node.address], id: node.id, title: node.title };
                    } else if (node.address) {
                        return { ...node, children: [] }; // fallback
                    }
                    const resolvedChildren = (node.children || []).map(resolveNode);
                    const resolved = { ...node, children: resolvedChildren };
                    resolvedMap[resolved.id] = resolved;
                    return resolved;
                };

                const resolvedRoot = resolveNode(root);

                const flattenTree = (node) => {
                    const all = [node];
                    if (node.children) {
                        node.children.forEach(child => {
                            all.push(...flattenTree(child));
                        });
                    }
                    return all;
                };

                setCurrentNode(resolvedRoot);
                setAllNodes(flattenTree(resolvedRoot));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleChildClick = (child) => {
        const target = child.address
            ? allNodes.find(n => n.id === child.address)
            : null;

        const resolved = target
            ? { ...target, id: child.id, title: child.title }
            : child;

        // Build the full ancestral path from the root node
        const buildFullPathToNode = (targetNode, rootNode) => {
            const path = [];

            const dfs = (node, acc = []) => {
                if (node.id === targetNode.id) {
                    path.push(...acc, node);
                    return true;
                }
                if (node.children) {
                    for (const c of node.children) {
                        if (dfs(c, [...acc, node])) return true;
                    }
                }
                return false;
            };

            dfs(rootNode);
            return path;
        };

        const newPath = buildFullPathToNode(resolved, allNodes.find(n => n.title === 'Home'));
        const newBreadcrumbs = newPath.slice(0, -1);

        setHistory([...history, currentNode]);
        setBreadcrumbs(newBreadcrumbs);
        setCurrentNode(resolved);
        setSearchQuery('');
        setSelectedNode(null);

        if (!resolved.children || resolved.children.length === 0) {
            setSelectedNode(resolved);
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
            setShowSuggestionInput(false);
            setFeedback('');
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
                            fetchAndBuildPublicTree().then((root) => {
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
                                            const fullPath = breadcrumbs.slice(0, index + 1);
                                            setCurrentNode(node);
                                            setHistory(fullPath.slice(0, -1));
                                            setBreadcrumbs(fullPath);
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
                        {!showSuggestionInput && (
                            <button
                                className="mobile-suggestion-toggle"
                                onClick={() => setShowSuggestionInput(true)}
                            >
                                Suggest a Correction
                            </button>
                        )}
                        {showSuggestionInput && (
                            <div className="mobile-suggestion-section">
                                <textarea
                                    className="mobile-suggestion-textarea"
                                    placeholder="Suggest a correction..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                                <button
                                    className="mobile-suggestion-submit"
                                    onClick={async () => {
                                        if (feedback?.trim()) {
                                            try {
                                                const { db } = await import('../firebaseConfig');
                                                const { collection, addDoc } = await import('firebase/firestore');
                                                await addDoc(collection(db, 'noteFeedback'), {
                                                    nodeId: selectedNode.id,
                                                    nodeTitle: selectedNode.title,
                                                    feedback: feedback.trim(),
                                                    timestamp: new Date()
                                                });
                                                setFeedback('');
                                                setSubmissionStatus('success');
                                                setTimeout(() => setSubmissionStatus(null), 3000);
                                            } catch (error) {
                                                setSubmissionStatus('error');
                                                setTimeout(() => setSubmissionStatus(null), 3000);
                                            }
                                        }
                                    }}
                                >
                                    Submit Suggestion
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {submissionStatus && (
                <div className={`mobile-submission-popup ${submissionStatus}`}>
                    {submissionStatus === 'success' ? 'Suggestion submitted!' : 'Failed to submit suggestion.'}
                </div>
            )}
        </div>
    );
};

export default MobileView;