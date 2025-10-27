import React, { useState } from 'react';

function OverlayControls({ onAddOverlay }) {
  const [showTextForm, setShowTextForm] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  
  const [textContent, setTextContent] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  
  const [imageUrl, setImageUrl] = useState('');

  const handleAddText = () => {
    if (!textContent.trim()) {
      alert('Please enter text content');
      return;
    }

    const textOverlay = {
      id: Date.now().toString(),
      type: 'text',
      content: textContent,
      position: { x: 0.1, y: 0.1 },
      size: { width: 0.3, height: 0.1 },
      style: {
        color: textColor,
        fontSize: textSize,
        fontWeight: 'bold',
        opacity: 1,
        zIndex: 10
      }
    };

    onAddOverlay(textOverlay);
    setTextContent('');
    setShowTextForm(false);
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      alert('Please enter image URL');
      return;
    }

    const imageOverlay = {
      id: Date.now().toString(),
      type: 'image',
      content: imageUrl,
      position: { x: 0.7, y: 0.1 },
      size: { width: 0.2, height: 0.15 },
      style: {
        opacity: 1,
        zIndex: 10
      }
    };

    onAddOverlay(imageOverlay);
    setImageUrl('');
    setShowImageForm(false);
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg border border-gray-300 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Overlays</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setShowTextForm(!showTextForm);
              setShowImageForm(false);
            }}
            className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium min-w-[100px]"
          >
            + Add Text
          </button>
          <button
            onClick={() => {
              setShowImageForm(!showImageForm);
              setShowTextForm(false);
            }}
            className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium min-w-[100px]"
          >
            + Add Image
          </button>
        </div>
      </div>

      {showTextForm && (
        <div className="p-4 bg-gray-200 rounded-lg border border-gray-300">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Add Text Overlay</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Content:</label>
            <input
              type="text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color:</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size:</label>
              <input
                type="number"
                value={textSize}
                onChange={(e) => setTextSize(parseInt(e.target.value))}
                min="12"
                max="72"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddText} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Add Text
            </button>
            <button
              onClick={() => setShowTextForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showImageForm && (
        <div className="p-4 bg-gray-200 rounded-lg border border-gray-300">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Add Image Overlay</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL:</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
            💡 Use a transparent PNG for logos
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddImage} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Add Image
            </button>
            <button
              onClick={() => setShowImageForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverlayControls;

