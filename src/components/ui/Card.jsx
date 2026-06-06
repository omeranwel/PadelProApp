import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-bg-card/80 backdrop-blur-md border border-white/5 shadow-xl rounded-2xl p-6 
        transition-all duration-300 ease-out
        ${onClick ? 'cursor-pointer hover:border-accent/30 hover:bg-bg-card hover:-translate-y-1 hover:shadow-accent/5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
