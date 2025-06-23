import React, { useState } from 'react';
import '.././css/notes.css';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const NotesView = ({ notes, nodeId, nodeTitle }) => {
    const [showModal, setShowModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!notes) {
        return <p>No notes available.</p>;
    }

    const handleSubmitFeedback = async () => {
        if (!feedback.trim()) return;
        try {
            await addDoc(collection(db, 'noteFeedback'), {
                nodeId,
                nodeTitle,
                feedback,
                timestamp: new Date(),
            });
            setSubmitted(true);
            setFeedback('');
            setTimeout(() => {
                setShowModal(false);
                setSubmitted(false);
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <section className="notes-section">
            <div
                className="notes-content"
                dangerouslySetInnerHTML={{ __html: notes }}
            />
            <button className="feedback-button" onClick={() => setShowModal(true)}>
                Suggest Correction
            </button>
            {showModal && (
                <div className="feedback-modal">
                    <div className="feedback-modal-content">
                        {submitted ? (
                            <p className="feedback-confirmation">Thanks for your feedback!</p>
                        ) : (
                            <>
                                <h3>Suggest a Correction</h3>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Let us know how we can improve this note..."
                                />
                                <div className="modal-actions">
                                    <button onClick={handleSubmitFeedback}>Submit</button>
                                    <button onClick={() => setShowModal(false)}>Close</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default NotesView;