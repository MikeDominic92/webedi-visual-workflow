import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const dotSizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`relative ${sizeClasses[size]}`}>
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`absolute ${dotSizeClasses[size]} bg-blue-500 rounded-full`}
            style={{
              top: '50%',
              left: '50%',
              marginTop: `-${parseInt(dotSizeClasses[size].split(' ')[0].slice(2)) / 2}rem`,
              marginLeft: `-${parseInt(dotSizeClasses[size].split(' ')[0].slice(2)) / 2}rem`,
            }}
            animate={{
              x: [0, 20, 0, -20, 0],
              y: [-20, 0, 20, 0, -20],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;