import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageWrapper — wraps every page with fade-in animation.
 * Optionally accepts a `bg` prop (image URL) to show a page-specific
 * background with a dark overlay on top of the global body background.
 */
const PageWrapper = ({ children, bg }) => {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="min-h-screen pt-24 relative"
    >
      {/* Per-page background image with overlay */}
      {bg && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(7,13,26,0.82)' }} />
        </div>
      )}
      {children}
    </motion.main>
  );
};

export default PageWrapper;
