import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-bg-subtle text-text-secondary border-border',
    success: 'bg-success/10 text-success border-success/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
    orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
    ai: 'bg-ai-purple/10 text-ai-purple border-ai-purple/20',
    
    // Skill specific
    beginner: 'bg-[#064E3B] text-[#34D399] border-[#065F46]',
    intermediate: 'bg-[#1E3A5F] text-[#60A5FA] border-[#1D4ED8]',
    advanced: 'bg-[#431407] text-[#FB923C] border-[#C2410C]',
    professional: 'bg-[#2E1065] text-[#C084FC] border-[#7C3AED]',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border
      ${variants[variant] || variants.default}
      ${className}
    `}>
      {variant === 'ai' && <span className="mr-1">✨</span>}
      {children}
    </span>
  );
};

export default Badge;
