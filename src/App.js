import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./views/home";
import Login from "./views/Login";
import PrivateRoute from "./components/PrivateRoute";
import HierarchyNavigator from "./components/hierachyNavigator";
import NodeEditor from "./views/nodeEditor";
import DisplayView from "./views/displayView";
import GuidelineViewer from "./views/guidelineView";
import MobileWarningScreen from "./views/MobileView";
import PageNotFound from "./views/404";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <Home />
              }
            />
            <Route
              path="/edit"
              element={
                <PrivateRoute>
                  <NodeEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/display"
              element={
                <DisplayView />
              }
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;