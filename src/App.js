import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./views/home";
import HierarchyNavigator from "./components/hierachyNavigator";
import NodeEditor from "./views/nodeEditor";
import DisplayView from "./views/displayView";
import GuidelineViewer from "./views/guidelineView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MobileWarningScreen from "./views/MobileView";
import PageNotFound from "./views/404";
// Create a QueryClient instance
const queryClient = new QueryClient();

const App = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if the user is on a mobile device
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);

    // Initial check
    checkMobile();

    // Add an event listener for screen resizing
    window.addEventListener("resize", checkMobile);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    // Display a message for mobile users
    return (
      <MobileWarningScreen />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Home route */}
            <Route path="/" element={<Home />} />

            {/* Route for navigating nodes */}
            <Route path="/hierarchy" element={<HierarchyNavigator />} />

            {/* Route for editing a selected node */}
            <Route path="/edit" element={<NodeEditor />} />

            {/* Route for display view */}
            <Route path="/display" element={<DisplayView />} />

            {/* Route for display view */}
            <Route path="/guidelines" element={<GuidelineViewer />} />

            {/* Redirect any unmatched routes to Home */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;