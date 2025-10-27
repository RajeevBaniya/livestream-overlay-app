import React, { useState, useRef, useEffect } from 'react';
import Overlay from './Overlay';

function OverlayCanvas({ overlays, onOverlaysChange }) {
  const canvasRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    const interval = setInterval(updateSize, 1000);

    return () => {
      window.removeEventListener('resize', updateSize);
      clearInterval(interval);
    };
  }, []);

  const handleOverlayUpdate = (id, updates) => {
    const updatedOverlays = overlays.map(overlay =>
      overlay.id === id ? { ...overlay, ...updates } : overlay
    );
    onOverlaysChange(updatedOverlays);
  };

  const handleOverlayRemove = (id) => {
    const filteredOverlays = overlays.filter(overlay => overlay.id !== id);
    onOverlaysChange(filteredOverlays);
  };

  return (
    <div
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 overflow-visible"
    >
      {containerSize.width > 0 && overlays.map(overlay => (
        <div key={overlay.id} className="pointer-events-auto">
          <Overlay
            overlay={overlay}
            onUpdate={handleOverlayUpdate}
            onRemove={handleOverlayRemove}
            containerSize={containerSize}
          />
        </div>
      ))}
    </div>
  );
}

export default OverlayCanvas;

