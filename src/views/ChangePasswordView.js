import React, { useState, useEffect } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/changePassword.css";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const auth = getAuth();

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const user = auth.currentUser;

            if (!user) {
                setError("No user is logged in.");
                return;
            }

            await updatePassword(user, newPassword);
            setSuccess("Password updated successfully!");
            setTimeout(() => {
                navigate("/edit"); // Redirect to the main app or dashboard
            }, 3000);
        } catch (err) {
            console.error("Error updating password:", err);
            setError(err.message || "Failed to update password.");
        }
    };

    return (
        <div className="change-password-page">
            <div className="change-password-card">
                <h1 className="change-password-title">Set New Password</h1>
                <form onSubmit={handleChangePassword} className="change-password-form">
                    <input
                        type="password"
                        className="change-password-input"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="change-password-input"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="change-password-button">Update Password</button>
                </form>
                {error && <p className="change-password-error">{error}</p>}
                {success && <p className="change-password-success">{success}</p>}
            </div>
        </div>
    );
};

export default ChangePassword;