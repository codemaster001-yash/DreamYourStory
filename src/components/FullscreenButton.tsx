import React, { useState } from "react";

const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <button
      onClick={handleFullscreen}
      className="fixed top-4 right-4 z-50 bg-white rounded-full shadow-lg p-2 hover:bg-gray-100 transition"
      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {/* Simple fullscreen icon (SVG) */}
      {isFullscreen ? (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 9L5 5M5 5v4M5 5h4M15 9l4-4M19 5v4M19 5h-4M9 15l-4 4M5 19v-4M5 19h4M15 15l4 4M19 19v-4M19 19h-4" />
        </svg>
      ) : (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zm6 10v6h-6v-2h4v-4h2zm-10 6H4v-6h2v4h4v2z" />
        </svg>
      )}
    </button>
  );
};

export default FullscreenButton;