import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSetPasswordMode, setIsSetPasswordMode] = useState(false); // Toggle between login and set password modes
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

    const handleSendLink = async () => {
        const actionCodeSettings = {
            url: "https://catholicdefensehub.com/login",
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem("emailForSignIn", email);
            setMessage("Login link sent! Check your email.");
            setError("");
        } catch (err) {
            setError("Failed to send login link. Please try again.");
        }
    };

    const handleLinkLogin = async () => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            try {
                const emailForSignIn = window.localStorage.getItem("emailForSignIn");
                const finalEmail = email || emailForSignIn;

                if (!finalEmail) {
                    throw new Error("No email provided for login.");
                }

                const userCredential = await signInWithEmailLink(auth, finalEmail, window.location.href);
                const user = userCredential.user;

                const idToken = await user.getIdToken();
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/session-login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ idToken }),
                });

                if (response.ok) {
                    localStorage.setItem("idToken", idToken);
                    navigate("/change-password");
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || "Login failed");
                }
            } catch (err) {
                setError("Failed to login with email link. Please try again.");
            }
        }
    };

    useEffect(() => {
        const currentUrl = window.location.href;

        if (isSignInWithEmailLink(auth, currentUrl)) {
            const email = window.localStorage.getItem("emailForSignIn") || prompt("Enter your email to complete login:");
            if (email) {
                signInWithEmailLink(auth, email, currentUrl)
                    .then((result) => {
                        console.log("User signed in:", result.user);
                        window.localStorage.removeItem("emailForSignIn");
                        navigate("/change-password");
                    })
                    .catch((err) => {
                        console.error("Error during email link login:", err);
                    });
            } else {
                console.error("No email provided for sign-in.");
            }
        }
    }, [auth, navigate]);

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Please sign in to continue</p>
                {!isSetPasswordMode ? (
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
                        <button type="submit" className="login-button">Sign In</button>
                        <button
                            type="button"
                            className="login-button set-password-button"
                            onClick={() => setIsSetPasswordMode(true)}
                        >
                            Set Password
                        </button>
                    </form>
                ) : (
                    // Set Password Mode
                    <div className="login-form">
                        <input
                            type="email"
                            className="login-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button className="login-button" onClick={handleSendLink}>
                            Send Login Link
                        </button>
                        <button
                            className="login-button back-button"
                            onClick={() => setIsSetPasswordMode(false)}
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