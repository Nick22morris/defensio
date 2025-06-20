import React, { useState, useEffect } from 'react';
import { isUserLoggedIn } from '../utils/auth'; // adjust path as needed
import HierarchyNavigator from '../components/hierachyNavigator';
import NotesView from '../components/noteView';
import '.././css/home.css';
import GlowingCrossWithQuotes from '../components/cross'
const Home = () => {
  const [currentNode, setCurrentNode] = useState(null);
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isUserLoggedIn());
  }, []);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  return (
    <div className="hq-container">
      {/* Header Section */}
      <header className="hq-header">
        <div className="hq-header-content">
          <h1 className="hq-header-title">Catholic Defense Hub</h1>
          <p className="hq-header-subtitle">
            Your frontline resource for defending the <i>One True Faith</i>.
          </p>
        </div>
        <div className="hq-header-login">
          {loggedIn ? (
            <>
              <button className="hq-login-button" onClick={() => {
                // Clear session/cookies/etc. and refresh
                localStorage.clear();
                window.location.reload();
              }}>
                Logout
              </button>
              <button className="hq-login-button" style={{ marginLeft: '10px' }} onClick={() => window.location.href = '/edit'}>
                Edit Mode
              </button>
            </>
          ) : (
            <button className="hq-login-button" onClick={() => window.location.href = '/login'}>
              Log In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Section */}
      <main className={`hq-main ${isSidebarVisible ? '' : 'collapsed-sidebar'}`}>
        <aside className={`hq-sidebar ${isSidebarVisible ? '' : 'hidden'}`}>
          <h2 className="hq-sidebar-title">About Catholic Defense Hub</h2>
          {isSidebarVisible && (
            <p className="hq-sidebar-text">
              Easily access clear, concise answers to common objections against Catholicism. Designed for evangelization, personal study, or apologetic discussions, Catholic Defense Hub equips you with quick references to Scripture, Church teachings, and logical arguments. Whether you’re engaging in friendly dialogue or deepening your understanding, this tool keeps the truth at your fingertips.
            </p>
          )}
          <button className="hq-toggle-sidebar" onClick={toggleSidebar}>
            {isSidebarVisible ? 'Dismiss' : 'Show Sidebar'}
          </button>
        </aside>
        <section className="hq-navigator">
          <h2 className="hq-section-title">Explore Objections</h2>
          <HierarchyNavigator onNodeChange={setCurrentNode} />
        </section>

        {/* Notes Section */}
        <section
          className={`hq-notes ${currentNode?.notes || currentNode?.body ? 'visible' : 'no-notes'}`}
        >
          {currentNode?.notes || currentNode?.body ? (
            <>
              <div className="hq-notes-header">{currentNode?.title || 'No Topic Selected'}</div>
              {currentNode?.body && <NotesView notes={currentNode.body} />}
              {currentNode?.notes && <NotesView notes={currentNode.notes} />}
            </>
          ) : (
            <GlowingCrossWithQuotes />
          )}
        </section>
      </main>

      {/* Footer Section */}
      <footer className="hq-footer">
        <p>&copy; {new Date().getFullYear()} Catholic Defense Hub. <i>Blessed Carlo Acutis pray for us.</i></p>
      </footer>
    </div>
  );
};

export default Home;