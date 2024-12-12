import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./views/home";
import Login from "./views/Login";
import ChangePassword from "./views/ChangePasswordView";
import PrivateRoute from "./components/PrivateRoute";
import NodeEditor from "./views/nodeEditor";
import DisplayView from "./views/displayView";
import PageNotFound from "./views/404";
import MobileWarningScreen from "./views/MobileView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";

const queryClient = new QueryClient();

const App = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if the user is on a mobile device
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile); // Cleanup
  }, []);

  const auth = getAuth();

  if (isMobile) {
    return <MobileWarningScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/display" element={<DisplayView />} />
            <Route path="/login" element={<Login />} />
            {/* Protected Routes */}
            <Route
              path="/edit"
              element={
                <PrivateRoute>
                  <NodeEditor />
                </PrivateRoute>
              }
            />
            <Route path="/change-password" element={<PrivateRoute>
              <ChangePassword />
            </PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;