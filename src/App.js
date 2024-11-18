import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from "./views/home";
import HierarchyNavigator from "./components/hierachyNavigator";
import NodeEditor from "./views/nodeEditor";
import DisplayView from "./views/displayView";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a QueryClient instance
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Home route */}
            <Route path="/home" element={<Home />} />

            {/* Route for navigating nodes */}
            <Route path="/hierarchy" element={<HierarchyNavigator />} />

            {/* Route for editing a selected node */}
            <Route path="/edit" element={<NodeEditor />} />

            {/* Route for display view */}
            <Route path="/display" element={<DisplayView />} />

            {/* Redirect any unmatched routes to Home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;