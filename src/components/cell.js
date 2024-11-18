import React, { useState } from 'react';
import '.././App.css'; // Ensure App.css is imported
import '.././css/cell.css';
const CellComponent = ({ title, onClick, hasChildren }) => {
  return (
    <div className="cell-container" onClick={onClick}>
      <span className="cell-title">{title}</span>
    </div>
  );
};

export default CellComponent;