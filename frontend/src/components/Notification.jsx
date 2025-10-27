import React, { useEffect } from 'react';

function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'info':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
  };

  return (
    <div className={`fixed top-5 right-5 p-4 border rounded-lg shadow-lg z-50 min-w-[250px] animate-slide-in ${getTypeClasses()}`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 bg-transparent border-none text-lg cursor-pointer p-0 leading-none hover:opacity-80"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Notification;

