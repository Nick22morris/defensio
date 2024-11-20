import React, { useState } from 'react';
import '../css/viewer.css';

const GuidelineViewer = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => {
        setIsOpen(!isOpen);
    };
    const handleOverlayClick = (event) => {
        // Check if the clicked element is the overlay itself
        if (event.target.classList.contains('modal-overlay')) {
            setIsOpen(false); // Close the modal
        }
    };
    return (
        <div>
            {/* Button to Open the Overlay */}
            <button onClick={toggleModal} className="guideline-button">
                View User Manual
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="modal-overlay" onClick={handleOverlayClick}>
                    <div className="modal-content">
                        <button className="close-button" onClick={toggleModal}>
                            &times;
                        </button>
                        <h1 className="guideline-title">User Manual for Editing the Database</h1>

                        <section className="guideline-section">
                            <h2>1. Guidelines for Database Changes</h2>
                            <h3>Editable Elements of a Node</h3>
                            <ul>
                                <li><strong>Title:</strong> Displayed at the top of the display view in large, bold text and serves as the clickable label in the hierarchy panel.</li>
                                <li><strong>Body:</strong> Contains content rendered below the title in the display view. This is used for Bible verses, catechism quotes, or statistics.</li>
                                <li><strong>Notes:</strong> Visible on the home screen for private user reference, including citations, explanations, or guidance.</li>
                                <li><strong>Children:</strong> Sub-nodes categorized under the current node. These can be subcategories or references rendered in the display view.</li>
                            </ul>
                        </section>

                        <section className="guideline-section">
                            <h2>2. Database Structure</h2>
                            <h3>Hierarchy Example</h3>
                            <ul>
                                <li><strong>Category:</strong> Protestantism</li>
                                <li><strong>Subcategory:</strong> Sola Scriptura</li>
                                <li><strong>Subcategory:</strong> The Pope</li>
                                <li><strong>Specific Objection:</strong> Why do you believe in the pope?</li>
                                <li><strong>Reference:</strong> Matthew 16 - Keys to the Kingdom</li>
                            </ul>

                            <h3>Content Guidelines</h3>
                            <ul>
                                <li><strong>Categories and Subcategories:</strong>
                                    <ul>
                                        <li>The <strong>body</strong> and <strong>notes</strong> should be blank.</li>
                                        <li>Should be organized appropriately and effeciently.</li>
                                    </ul>
                                </li>
                                <li><strong>Specific Objections:</strong>
                                    <ul>
                                        <li>The <strong>body</strong> should be blank.</li>
                                        <li>The <strong>notes</strong> should contain brief but detailed explanations for the user.</li>
                                    </ul>
                                </li>
                                <li><strong>References (children):</strong>
                                    <ul>
                                        <li><strong>Title:</strong> A concise, descriptive label (e.g., Matthew 16 - Keys to the Kingdom).</li>
                                        <li><strong>Body:</strong> Neatly formatted and properly cited content (e.g., verses, quotes, or statistics).</li>
                                        <li><strong>Notes:</strong> A duplicate of the body with citations, plus any additional user notes.</li>
                                    </ul>
                                </li>
                            </ul>
                        </section>

                        <section className="guideline-section">
                            <h2>3. Usage Notes for Editing</h2>
                            <h3>General Guidelines</h3>
                            <ul>
                                <li>
                                    <strong>Always Save Changes:</strong> Click the <strong>Save</strong> button after every edit to apply changes. You can also use the keyboard shortcut:
                                    <strong> Command + S</strong> (macOS) or <strong>Ctrl + S</strong> (Windows/Linux).
                                </li>
                                <li>
                                    <strong>Selected Node Awareness:</strong> Double-check which node is selected before editing. After saving, you may be sent back to the root node and need to reselect the intended node.
                                </li>
                                <li>
                                    <strong>No Undo Functionality:</strong>
                                    <ul>
                                        <li>Deleted nodes cannot be recovered.</li>
                                        <li>Edits overwrite the current state and cannot be undone.</li>
                                    </ul>
                                </li>
                            </ul>
                        </section>

                        <section className="guideline-section">
                            <h2>4. Additional Recommendations</h2>
                            <ul>
                                <li><strong>Consistent Formatting:</strong> Ensure all references (verses, quotes, statistics) are properly formatted and cited. Use consistent styling for readability.</li>
                                <li><strong>Preview Your Changes:</strong> Test your edits by navigating the hierarchy and viewing the display to ensure accuracy.</li>
                                <li><strong>Regular Backups:</strong> Take regular backups of the database or document major edits separately, as there is no built-in undo function.</li>
                            </ul>
                        </section>
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