import React, { useState, useEffect } from 'react';
import "../css/cross.css"
const quotes = [
    "“Always be ready to give an answer to anyone who asks you for a reason for the hope that is in you.” - 1 Peter 3:15",
    "“I am the way and the truth and the life. No one comes to the Father except through me.” - John 14:6",
    "“For where two or three are gathered in my name, there am I among them.” - Matthew 18:20",
    "“Be still, and know that I am God.” - Psalm 46:10",
    "“Your word is a lamp to my feet and a light to my path.” - Psalm 119:105",
    "“Faith is the assurance of things hoped for, the conviction of things not seen.” - Hebrews 11:1",
    "“Come to me, all who labor and are heavy laden, and I will give you rest.” - Matthew 11:28",
    "“Let your light so shine before men, that they may see your good works and glorify your Father in heaven.” - Matthew 5:16",
    "“He who eats my flesh and drinks my blood has eternal life, and I will raise him up on the last day.” - John 6:54",
    "“Do not be conformed to this world, but be transformed by the renewal of your mind.” - Romans 12:2",
];

const GlowingCrossWithQuotes = () => {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        }, 10000); // Rotate every 10 seconds
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    return (
        <div className="hq-no-notes-content">
            <div className="hq-glowing-cross">
                <img src="/logo2.png" alt="Glowing Cross" className="hq-glowing-image" />
            </div>
            <p className="hq-no-notes-text">{quotes[currentQuoteIndex]}</p>
        </div>
    );
};

export default GlowingCrossWithQuotes;