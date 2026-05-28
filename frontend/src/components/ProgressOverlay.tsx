import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgressOverlay: React.FC = () => {
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    const handleStart = () => setActiveRequests((prev) => prev + 1);
    const handleEnd = () => setActiveRequests((prev) => Math.max(0, prev - 1));

    window.addEventListener('api-request-start', handleStart);
    window.addEventListener('api-request-end', handleEnd);

    return () => {
      window.removeEventListener('api-request-start', handleStart);
      window.removeEventListener('api-request-end', handleEnd);
    };
  }, []);

  return (
    <AnimatePresence>
      {activeRequests > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-lg font-medium text-white">Processing...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgressOverlay;
