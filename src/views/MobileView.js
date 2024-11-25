import React from "react";
import "../css/mobile.css";

import sun from "../assets/sun.png";
import cloud1 from "../assets/cloud1.png";
import cloud2 from "../assets/cloud2.png";
import shepherd from "../assets/shepherd.png";

const MobileWarningScreen = () => {
    return (
        <div className="scene">
            {/* Sun */}
            <img src={sun} alt="Sun" className="sun" />

            {/* Clouds */}
            <img src={cloud1} alt="Cloud" className="cloud cloud1" />
            <img src={cloud2} alt="Cloud" className="cloud cloud2" />

            {/* Text in the Sky */}
            <div
                className="sky-text"
                style={{
                    position: "absolute",
                    top: "20%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    textAlign: "center",
                    color: "white",
                }}
            >
                <h1
                    className="sky-title"
                    style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    "He leads me beside still waters; He restores my soul."
                </h1>
                <p
                    className="sky-citation"
                    style={{
                        fontSize: "10px",
                        marginTop: "5px",
                        fontStyle: "italic",
                        color: "#f0f8ff",
                    }}
                >
                    (Psalm 23:2-3, ESV)
                </p>
                <p
                    className="sky-subtext"
                    style={{
                        fontSize: "14px",
                        marginTop: "10px",
                        fontStyle: "italic",
                        color: "#f8f9fa",
                        textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    Let the Shepherd guide you to a bigger view. Please switch to a desktop.
                </p>
            </div>
        </div>
    );
};

export default MobileWarningScreen;