import React from 'react';
import { Box, keyframes } from '@mui/material';
import { motion } from 'framer-motion';

// Define animations
const gridAnimation = keyframes`
  0% {
    background-position: 0px 0px;
  }
  100% {
    background-position: 50px 50px;
  }
`;

const pulseAnimation = keyframes`
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0.3;
  }
`;

const AnimatedBackground: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #121212 0%, #1a237e 100%)',
      }}
    >
      {/* Grid pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(63, 81, 181, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(63, 81, 181, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: `${gridAnimation} 20s linear infinite`,
        }}
      />

      {/* Floating orbs */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(63, 81, 181, ${Math.random() * 0.3 + 0.1}) 0%, rgba(63, 81, 181, 0) 70%)`,
            filter: 'blur(10px)',
          }}
          animate={{
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            scale: [Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Pulse effect */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(circle, rgba(63, 81, 181, 0.1) 0%, rgba(63, 81, 181, 0) 70%)',
          animation: `${pulseAnimation} 8s ease-in-out infinite`,
        }}
      />
    </Box>
  );
};

export default AnimatedBackground; 