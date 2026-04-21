import React from 'react';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-bg-card border border-border rounded-2xl ${className}`}>
      {Icon && <Icon size={48} className="text-text-muted mb-4" />}
      <h3 className="text-xl font-bold font-display mb-2">{title}</h3>
      <p className="text-text-secondary max-w-xs mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
