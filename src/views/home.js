import React, { useState } from 'react';
import HierarchyNavigator from '../components/hierachyNavigator';
import NotesView from '../components/noteView'; // Import NotesView
import '.././css/home.css';

const Home = () => {
  const [currentNode, setCurrentNode] = useState(null);

  return (
    <div className="page-container">
      {/* Header Section */}
      <header className="header">
        <h1 className="header-title">Doctrine Deck</h1>
        <p className="header-subtitle">
          A modern resource for everyday Catholics – Defend the faith with ease.
        </p>
      </header>

      {/* Main Content Section */}
      <main className="main-content">
        {/* Sidebar Section */}
        <aside className="sidebar">
          <img src="/logo.png" alt="Defensio Logo" className="sidebar-logo" />
          <h2 className="sidebar-title">Welcome to Doctrine Deck</h2>
          <p className="sidebar-text">
            Dive into a collection of answers and resources crafted for common Catholic critiques. Explore objections, find references, and learn structured arguments to engage thoughtfully.
          </p>
          <p className="highlight-text">Navigate topics using the panel on the right.</p>
        </aside>

        {/* Hierarchy Navigator Section */}
        <section className="navigator-section">
          <h2 className="navigator-title">Explore Topics</h2>
          <HierarchyNavigator onNodeChange={setCurrentNode} />
        </section>
      </main>

      {/* Notes Section */}
      {currentNode?.notes && <NotesView notes={currentNode.notes} />}

      {/* Footer Section */}
      <footer className="footer">
        <p>&copy; 2024 Doctrine Deck. Strengthening faith through understanding.</p>
      </footer>
    </div>
  );
};

export default Home;