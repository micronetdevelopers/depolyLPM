import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  enabled, 
  onChange, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5'
  };

  const translateClasses = {
    sm: enabled ? 'translate-x-4' : 'translate-x-0',
    md: enabled ? 'translate-x-5' : 'translate-x-0'
  };

  return (
    <button
      type="button"
      className={`
        ${sizeClasses[size]} ${enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
        relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={`
          ${thumbSizeClasses[size]} ${translateClasses[size]}
          pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 
          transition duration-200 ease-in-out
        `}
      />
    </button>
  );
};