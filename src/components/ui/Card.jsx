import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-bg-card border border-border rounded-xl p-5 
        transition-all duration-200 
        ${onClick ? 'cursor-pointer hover:border-border-strong hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
