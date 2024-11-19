import React from 'react';
import '.././css/notes.css';

const NotesView = ({ notes }) => {
    if (!notes) {
        return <p>No notes available.</p>;
    }

    return (
        <section className="notes-section">
            <h2 className="notes-title">Notes</h2>
            <div
                className="notes-content"
                dangerouslySetInnerHTML={{ __html: notes }}
            />
        </section>
    );
};

export default NotesView;