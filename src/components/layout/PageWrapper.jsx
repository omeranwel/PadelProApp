import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageWrapper — wraps every page with fade-in animation.
 * Accepts an optional `bg` prop (image URL from /public) that renders 
 * a fixed background image visible through all page content.
 */
const PageWrapper = ({ children, bg }) => {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="min-h-screen pt-24 relative"
      style={{
        // The background image sits on this element itself — no z-index fighting
        ...(bg ? {
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        } : {})
      }}
    >
      {/* Unified dark overlay on top of every page background */}
      {bg && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(7,13,26,0.75) 0%, rgba(7,13,26,0.6) 40%, rgba(7,13,26,0.85) 100%)', zIndex: 0 }}
        />
      )}
      {/* Page content goes above the overlay */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </motion.main>
  );
};

export default PageWrapper;
