import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
} from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import "../css/login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isResetPasswordMode, setIsResetPasswordMode] = useState(false); // Toggle between login and reset password modes
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const idToken = await user.getIdToken();
            console.log("ID Token:", idToken);

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/session-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
            });

            if (response.ok) {
                localStorage.setItem("idToken", idToken);
                navigate("/edit");
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Login failed");
            }
        } catch (err) {
            setError("Invalid email or password.");
        }
    };

    const handleSendResetLink = async () => {
        const actionCodeSettings = {
            url: "http://catholicdefensehub.com/change-password", // Redirect URL for setting the new password
            handleCodeInApp: true,
        };

        try {
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem("emailForReset", email); // Store the email locally
            setMessage("Password reset link sent! Check your email.");
            setError("");
        } catch (err) {
            console.error("Error sending password reset link:", err);
            setError("Failed to send password reset link. Please try again.");
        }
    };

    useEffect(() => {
        const currentUrl = window.location.href;

        if (isSignInWithEmailLink(auth, currentUrl)) {
            const email = window.localStorage.getItem("emailForReset") || prompt("Enter your email to reset your password:");
            if (email) {
                signInWithEmailLink(auth, email, currentUrl)
                    .then(() => {
                        window.localStorage.removeItem("emailForReset");
                        navigate("/change-password");
                    })
                    .catch((err) => {
                        console.error("Error during password reset link completion:", err);
                        setError("Failed to complete password reset. Please try again.");
                    });
            } else {
                console.error("No email provided for password reset.");
                setError("Email is required to reset your password.");
            }
        }
    }, [navigate]);

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">{isResetPasswordMode ? "Reset Password" : "Welcome Back"}</h1>
                <p className="login-subtitle">
                    {isResetPasswordMode ? "Enter your email to reset your password" : "Please sign in to continue"}
                </p>
                {!isResetPasswordMode ? (
                    // Default Login Mode
                    <form onSubmit={handleLogin} className="login-form">
                        <input
                            type="email"
                            className="login-input"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            className="login-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className="login-button">
                            Sign In
                        </button>
                        <button
                            type="button"
                            className="login-button reset-password-button"
                            onClick={() => setIsResetPasswordMode(true)}
                        >
                            Forgot Password?
                        </button>
                    </form>
                ) : (
                    // Reset Password Mode
                    <div className="login-form">
                        <input
                            type="email"
                            className="login-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button className="login-button" onClick={handleSendResetLink}>
                            Send Reset Link
                        </button>
                        <button
                            className="login-button back-button"
                            onClick={() => setIsResetPasswordMode(false)}
                        >
                            Back
                        </button>
                    </div>
                )}
                {error && <p className="login-error">{error}</p>}
                {message && <p className="login-message">{message}</p>}
            </div>
        </div>
    );
};

export default Login;