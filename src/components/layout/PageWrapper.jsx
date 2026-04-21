import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen pt-24"
    >
      {children}
    </motion.main>
  );
};

export default PageWrapper;
