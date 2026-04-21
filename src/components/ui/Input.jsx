import React from 'react';

const Input = ({ label, error, className = '', helperText, icon: Icon, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-blue">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            w-full bg-bg-elevated border border-border-strong rounded-lg py-2.5 px-4
            text-text-primary placeholder:text-text-muted
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/15
            ${error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
    </div>
  );
};

export default Input;
