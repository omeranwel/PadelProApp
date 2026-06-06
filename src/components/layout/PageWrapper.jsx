import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children }) => {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="min-h-screen pt-24"
    >
      {children}
    </motion.main>
  );
};

export default PageWrapper;
