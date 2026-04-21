import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  disabled = false, 
  icon: Icon,
  ...props 
}) => {
  const variants = {
    primary: 'bg-accent-orange text-white hover:opacity-90',
    secondary: 'bg-bg-subtle text-text-primary border border-border-strong hover:bg-bg-elevated',
    outline: 'bg-transparent border border-accent-blue text-accent-blue hover:bg-accent-blue/10',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-subtle',
    danger: 'bg-danger text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 18} className="mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
