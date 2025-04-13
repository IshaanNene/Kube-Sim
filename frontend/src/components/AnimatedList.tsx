import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedListProps {
  children: ReactNode;
}

/**
 * A custom animated list component that doesn't use AnimatePresence directly
 * to avoid TypeScript errors
 */
const AnimatedList: React.FC<AnimatedListProps> = ({ children }) => {
  return (
    <div className="animated-list-container">
      {React.Children.map(children, (child) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedList; 