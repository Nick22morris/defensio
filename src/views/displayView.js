import React, { useState, useEffect } from 'react';
import '../css/display-view.css';

const DisplayView = () => {
  const [node, setNode] = useState(null);

  useEffect(() => {
    const channel = new BroadcastChannel('node-updates');
    channel.onmessage = (event) => {
      if (event.data.type === 'update') {
        setNode(event.data.node);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const hasBody = node?.body && node.body.trim() !== '';

  return (
    <div className="display-view">
      {!hasBody ? (
        <div className="default-slide">
          <h1 className="slide-question">I am a Catholic</h1>
          <p className="slide-subtitle">Ask Me Questions</p>
        </div>
      ) : (
        <div className="content-slide">
          <h1 className="slide-title">{node.title}</h1>
          <div
            className="slide-body"
            dangerouslySetInnerHTML={{ __html: node.body }}
          />
        </div>
      )}
    </div>
  );
};

export default DisplayView;