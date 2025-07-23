import React from 'react';
import { motion } from 'framer-motion';
import { config } from '../config/environment';

const AIStatusIndicator: React.FC = () => {
  if (!config.ENABLE_AI_INTEGRATION) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-4 py-2 shadow-lg"
    >
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-2 h-2 bg-white rounded-full"
        />
        <span className="text-white text-sm font-medium">
          Gemini 2.5 Pro Active
        </span>
      </div>
    </motion.div>
  );
};

export default AIStatusIndicator;