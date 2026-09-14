import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-cafetin-dark">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl border border-cafetin-light/30 bg-white focus:outline-none focus:ring-2 focus:ring-cafetin-teal focus:border-transparent text-cafetin-dark placeholder-cafetin-light transition-all ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};
