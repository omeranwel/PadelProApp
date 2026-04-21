import React from 'react';

const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const colors = [
    'bg-accent-blue',
    'bg-accent-orange',
    'bg-ai-purple',
    'bg-success',
    'bg-warning',
  ];

  const getInitials = (n) => {
    return n ? n.split(' ').map(i => i[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  const colorIndex = name ? name.length % colors.length : 0;

  return (
    <div className={`
      relative rounded-full overflow-hidden flex items-center justify-center shrink-0
      ${src ? '' : colors[colorIndex] + ' text-white font-bold'}
      ${sizes[size]}
      ${className}
    `}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

export default Avatar;
