import React from 'react';

const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-5 flex flex-col gap-4 animate-pulse ${className}`}>
      <div className="aspect-video bg-bg-elevated rounded-lg" />
      <div className="space-y-2">
        <div className="h-5 bg-bg-elevated rounded w-3/4" />
        <div className="h-4 bg-bg-elevated rounded w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="h-4 bg-bg-elevated rounded w-20" />
        <div className="h-8 bg-bg-elevated rounded w-24" />
      </div>
    </div>
  );
};

export default SkeletonCard;
