import React from 'react';
import { Rnd } from 'react-rnd';

function Overlay({ overlay, onUpdate, onRemove, containerSize }) {
  const handleDragStop = (e, d) => {
    const normalizedX = d.x / containerSize.width;
    const normalizedY = d.y / containerSize.height;
    
    onUpdate(overlay.id, {
      position: { x: normalizedX, y: normalizedY }
    });
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    const normalizedWidth = parseInt(ref.style.width) / containerSize.width;
    const normalizedHeight = parseInt(ref.style.height) / containerSize.height;
    const normalizedX = position.x / containerSize.width;
    const normalizedY = position.y / containerSize.height;
    
    onUpdate(overlay.id, {
      position: { x: normalizedX, y: normalizedY },
      size: { width: normalizedWidth, height: normalizedHeight }
    });
  };

  const pixelPosition = {
    x: overlay.position.x * containerSize.width,
    y: overlay.position.y * containerSize.height
  };

  const pixelSize = {
    width: overlay.size.width * containerSize.width,
    height: overlay.size.height * containerSize.height
  };

  const renderContent = () => {
    if (overlay.type === 'text') {
      return (
        <div
          className="w-full h-full flex items-center justify-center break-words p-2 select-none"
          style={{
            color: overlay.style.color || '#ffffff',
            fontSize: `${overlay.style.fontSize || 24}px`,
            fontWeight: overlay.style.fontWeight || 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {overlay.content}
        </div>
      );
    } else if (overlay.type === 'image') {
      return (
        <img
          src={overlay.content}
          alt="Overlay"
          className="w-full h-full object-contain select-none pointer-events-none"
        />
      );
    }
  };

  return (
    <Rnd
      position={{ x: pixelPosition.x, y: pixelPosition.y }}
      size={{ width: pixelSize.width, height: pixelSize.height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="window"
      style={{
        border: '2px dashed rgba(255, 255, 255, 0.5)',
        backgroundColor: overlay.type === 'text' ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
        cursor: 'move',
        zIndex: overlay.style.zIndex || 10,
        opacity: overlay.style.opacity || 1
      }}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true
      }}
    >
      <div className="relative w-full h-full">
        {renderContent()}
        <button
          onClick={() => onRemove(overlay.id)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-none bg-red-600 text-white cursor-pointer text-sm flex items-center justify-center shadow-md z-50"
          title="Remove overlay"
        >
          ×
        </button>
      </div>
    </Rnd>
  );
}

export default Overlay;

