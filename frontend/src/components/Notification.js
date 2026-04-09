'use client';

import { useState, useEffect } from 'react';

/**
 * A reusable Toast-style notification component.
 * Usage: <Notification message={msg} type="error" onClose={() => setMsg('')} />
 */
export default function Notification({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to finish before calling onClose
    setTimeout(onClose, 300);
  };

  if (!message && !isVisible) return null;

  const bgColors = {
    success: 'bg-zinc-900 border-green-500/50 text-green-400',
    error: 'bg-zinc-900 border-red-500/50 text-red-400',
    info: 'bg-zinc-900 border-blue-500/50 text-blue-400',
  };

  return (
    <div 
      className={`fixed top-6 right-6 z-[9999] transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
      }`}
    >
      <div className={`flex items-center gap-4 px-6 py-4 border backdrop-blur-md shadow-2xl ${bgColors[type] || bgColors.info}`}>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-1">
            {type}
          </span>
          <p className="text-xs font-medium tracking-tight">
            {message}
          </p>
        </div>
        <button 
          onClick={handleClose}
          className="ml-4 p-1 hover:bg-white/10 transition-colors uppercase text-[10px] opacity-50 font-bold"
        >
          [Close]
        </button>
      </div>
    </div>
  );
}
