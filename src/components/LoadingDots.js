import React from 'react';
import './LoadingDots.css'; // Ensure you create this CSS file

function LoadingDots() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-cyan-100">
      <div className="loading-container">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );
}

export default LoadingDots;
