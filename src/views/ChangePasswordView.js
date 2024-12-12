import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import "../css/changePassword.css"
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get("oobCode");
    const navigate = useNavigate();

    const handleChangePassword = async () => {
        try {
            if (!oobCode) {
                throw new Error("Invalid or missing reset code.");
            }

            // Verify the reset code
            await verifyPasswordResetCode(auth, oobCode);

            // Confirm the password reset
            await confirmPasswordReset(auth, oobCode, newPassword);

            setMessage("Password has been reset successfully. You can now log in with your new password.");
            setError("");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || "Failed to reset password. Please try again.");
            setMessage("");
        }
    };

    return (
        <div className="change-password-page">
            <div className="change-password-card">
                <h1 className="change-password-title">Reset Your Password</h1>
                {message ? (
                    <p className="change-password-success">{message}</p>
                ) : (
                    <div className="change-password-form">
                        <input
                            type="password"
                            className="change-password-input"
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button className="change-password-button" onClick={handleChangePassword}>
                            Reset Password
                        </button>
                    </div>
                )}
                {error && <p className="change-password-error">{error}</p>}
            </div>
        </div>
    );
};

export default ChangePassword;