import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("idToken");

    // Redirect to login if no token is present
    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;