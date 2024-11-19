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
        <h1 className="header-title">Defensio</h1>
        <p className="header-subtitle">
          A modern resource for Catholic apologists – Defend the faith with clarity.
        </p>
      </header>

      {/* Main Content Section */}
      <main className="main-content">
        {/* Sidebar Section */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Welcome to Defensio</h2>
          <p className="sidebar-text">
            Dive into a collection of answers and resources crafted for Catholic apologists. Explore objections, find references, and learn structured arguments to engage thoughtfully.
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
        <p>&copy; 2024 Defensio. Strengthening faith through understanding.</p>
      </footer>
    </div>
  );
};

export default Home;