import React, { useState } from 'react';
import '../css/viewer.css';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase auth functions
const GuidelineViewer = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const auth = getAuth(); // Initialize Firebase Auth
    const toggleModal = () => {
        setIsOpen(!isOpen);
    };
    const handleOverlayClick = (event) => {
        // Check if the clicked element is the overlay itself
        if (event.target.classList.contains('modal-overlay')) {
            setIsOpen(false); // Close the modal
        }
    };

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log('User signed out');
                navigate('/login'); // Redirect to login page
            })
            .catch((error) => {
                console.error('Error signing out:', error);
            });
    };

    return (
        <div>
            <div className="editor-controls">
                <button onClick={() => navigate('/')} className="guideline-button">
                    Home
                </button>
                <button onClick={toggleModal} className="guideline-button">
                    Help
                </button>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="modal-overlay" onClick={handleOverlayClick}>
                    <div className="modal-content">
                        <button className="close-button" onClick={toggleModal}>
                            &times;
                        </button>
                        <div className="guideline-video-container">
                            <iframe
                                width="100%"
                                height="300"
                                src="https://www.youtube.com/embed/Aw3MuKIICS8"
                                title="Catholic Defense Hub - Editing Walkthrough"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        {/* "Done" Button */}
                        <div className="modal-footer">
                            <button onClick={toggleModal} className="done-button">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuidelineViewer;