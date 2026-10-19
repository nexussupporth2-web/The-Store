import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50 bg-[#18231f] text-white px-5 py-2.5 rounded-full shadow-xl text-sm font-medium border border-white/10 flex items-center gap-2 animate-bounce-short pointer-events-none transition-all duration-300"
      style={{
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
      }}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>{message}</span>
    </div>
  );
};
