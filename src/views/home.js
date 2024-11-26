import React, { useState } from 'react';
import HierarchyNavigator from '../components/hierachyNavigator';
import NotesView from '../components/noteView';
import '.././css/home.css';

const Home = () => {
  const [currentNode, setCurrentNode] = useState(null);

  return (
    <div className="hq-container">
      {/* Header Section */}
      <header className="hq-header">
        <div className="hq-header-content">
          <h1 className="hq-header-title">Catholic Defense Hub</h1>
          <p className="hq-header-subtitle">
            Your frontline resource for defending Catholicism. Engage, educate, and stand firm.
          </p>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="hq-main">
        {/* Sidebar Section */}
        <aside className="hq-sidebar">
          <img src="/logo2.png" alt="Defensio Logo" className="hq-sidebar-logo" />
          <h2 className="hq-sidebar-title">About Catholic Defense Hub</h2>
          <p className="hq-sidebar-text">
            Navigate Catholic objections and find structured responses. Whether you’re a seasoned apologist or a curious learner, Standoff HQ equips you with the tools to engage meaningfully.
          </p>
        </aside>

        {/* Hierarchy Navigator Section */}
        <section className="hq-navigator">
          <h2 className="hq-section-title">Explore Topics</h2>
          <HierarchyNavigator onNodeChange={setCurrentNode} />
        </section>

        {/* Notes Section */}
        <section className={`hq-notes ${currentNode?.notes || currentNode?.body ? 'visible' : ''}`}>
          <div className="hq-notes-header">
            {currentNode?.title || "No Topic Selected"}
          </div>
          {currentNode?.body && (
            <NotesView notes={currentNode.body} title={"Quote"} />
          )}
          {currentNode?.notes ? (
            <NotesView notes={currentNode.notes} title={"Notes"} />
          ) : (
            !currentNode?.body && (
              <p className="hq-notes-placeholder">Select a topic to view notes.</p>
            )
          )}
        </section>
      </main>

      {/* Footer Section */}
      <footer className="hq-footer">
        <p>&copy; 2024 Catholic Defense Hub. Strengthening faith through understanding.</p>
      </footer>
    </div>
  );
};

export default Home;