import React from "react";
import "../css/404.css";

// Import assets if they are stored in `src/assets`:
import sun from "../assets/sun.png";
import cloud1 from "../assets/cloud1.png";
import cloud2 from "../assets/cloud2.png";
import shepherd from "../assets/shepherd.png";
import sheep1 from "../assets/sheep1.png";
import sheep2 from "../assets/sheep2.png";

const PageNotFound = () => {
    const containerWidth = window.innerWidth; // Get screen width
    const containerHeight = window.innerHeight; // Get screen height

    const generateSheepPositions = (n, containerWidth, containerHeight) => {
        const positions = [];
        const minDistance = 70; // Minimum distance in pixels

        const isTooClose = (newX, newY) => {
            return positions.some(({ left, bottom }) => {
                const existingX = parseFloat(left) / 100 * containerWidth;
                const existingY = parseFloat(bottom) / 100 * containerHeight;

                const distance = Math.sqrt(
                    Math.pow(newX - existingX, 2) + Math.pow(newY - existingY, 2)
                );
                return distance < minDistance;
            });
        };

        while (positions.length < n) {
            const leftPercent = Math.random() * (90 - 15) + 15; // Random between 20% and 80%
            const bottomPercent = Math.random() * (20 - 4) + 4; // Random between 9% and 16%

            const leftPx = (leftPercent / 100) * containerWidth;
            const bottomPx = (bottomPercent / 100) * containerHeight;

            if (!isTooClose(leftPx, bottomPx)) {
                const facingLeft = Math.random() < 0.5; // Randomly decide if the sheep is facing left
                console.log(facingLeft)
                positions.push({ left: `${leftPercent}%`, bottom: `${bottomPercent}%`, facingLeft });
            }
        }

        return positions;
    };
    const sheepPositions = generateSheepPositions(15, containerWidth, containerHeight); // Generate 10 sheep

    return (
        <div className="scene">
            {/* Sun */}
            <img src={sun} alt="Sun" className="sun" />

            {/* Clouds */}
            <img src={cloud1} alt="Cloud" className="cloud cloud1" />
            <img src={cloud2} alt="Cloud" className="cloud cloud2" />

            {/* Text in the Sky */}
            <div className="sky-text">
                <h1 className="sky-title">404: Are you lost, my child?</h1>
                <p className="sky-subtext">"Rejoice with me, for I have found my sheep that was lost."</p>
                <p className="sky-citation">(Luke 15:6)</p>
                <button
                    className="home-button"
                    onClick={() => (window.location.href = "/")}
                >
                    Return to the Homepage
                </button>
            </div>

            {/* Shepherd */}
            <img src={shepherd} alt="Shepherd" className="shepherd" />

            {/* Sheep */}
            {sheepPositions.map((pos, index) => (
                <img
                    key={index}
                    src={pos.facingLeft ? sheep1 : sheep2}
                    alt="Sheep"
                    className="sheep"
                    style={{
                        left: pos.left,
                        bottom: pos.bottom,
                        transform: "scaleX(-1)" // pos.facingLeft ? "scaleX(-1)" : "scaleX(1)", // Flip sheep horizontally
                    }}
                />
            ))}


            <div className="hill hill1"></div>
            <div className="hill hill2"></div>
            <div className="hill hill3"></div>

            {/* Button to Homepage */}

        </div>
    );
};

export default PageNotFound;