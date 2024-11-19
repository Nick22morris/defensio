import React from 'react';
import '.././App.css';
import '.././css/cell.css';

const CellComponent = ({ title, onClick, hasChildren, isSelected }) => {
  return (
    <div
      className={`cell-container ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span className="cell-title">{title}</span>
      {hasChildren && <span className="cell-children-icon">▶</span>}
    </div>
  );
};

export default CellComponent;