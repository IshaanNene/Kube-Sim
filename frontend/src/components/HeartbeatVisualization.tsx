import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { Node } from '../types';

// Define the heartbeat point interface
interface HeartbeatPoint {
  timestamp: number;
  value: number;
}

interface HeartbeatVisualizationProps {
  node: Node;
}

const HeartbeatVisualization: React.FC<HeartbeatVisualizationProps> = ({ node }) => {
  const theme = useTheme();
  const controls = useAnimation();
  const [points, setPoints] = useState<HeartbeatPoint[]>([]);
  const [prevHeartbeatCount, setPrevHeartbeatCount] = useState(node.HeartbeatCount);
  const [isHeartbeatActive, setIsHeartbeatActive] = useState<boolean>(false);
  const maxPoints = 100;
  const timeWindow = 10000; // 10 seconds window

  // Update heartbeat visualization when a new heartbeat is received
  useEffect(() => {
    // When heartbeat count increases, add a new peak
    if (node.HeartbeatCount > prevHeartbeatCount) {
      setIsHeartbeatActive(true);
      
      setPoints(prev => {
        const now = Date.now();
        // Create a sequence of points for a single heartbeat with sharp transitions
        const heartbeatPoints: HeartbeatPoint[] = [
          { timestamp: now, value: 0 },           // Baseline
          { timestamp: now + 100, value: 0 },     // Baseline
          { timestamp: now + 120, value: -0.2 },  // Q wave (quick drop)
          { timestamp: now + 130, value: 2 },     // R wave (sharp upstroke)
          { timestamp: now + 140, value: -0.5 },  // S wave (sharp drop)
          { timestamp: now + 160, value: 0 },     // Back to baseline
          { timestamp: now + 200, value: 0.2 },   // T wave start
          { timestamp: now + 250, value: 0 },     // T wave end
          // Add long baseline until next beat
          { timestamp: now + 600, value: 0 }
        ];

        const newPoints = [...prev, ...heartbeatPoints];
        // Keep fewer points to make the display less crowded
        return newPoints
          .filter(p => now - p.timestamp < timeWindow)
          .slice(-50); // Reduced from 100 to 50 max points
      });
      
      // Trigger animation
      controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 }
      });
      
      // Set a timeout to mark heartbeat as inactive after 1 second
      const timeoutId = setTimeout(() => {
        setIsHeartbeatActive(false);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
    
    setPrevHeartbeatCount(node.HeartbeatCount);

    // Cleanup old points periodically
    const interval = setInterval(() => {
      setPoints(prev => {
        const now = Date.now();
        return prev.filter(p => now - p.timestamp < timeWindow);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [node.HeartbeatCount, prevHeartbeatCount, controls]);

  const lastHeartbeatTime = new Date(node.LastHeartbeat).getTime();
  const timeSinceLastHeartbeat = Date.now() - lastHeartbeatTime;
  const isInactive = timeSinceLastHeartbeat > 20000; // Consider inactive after 20 seconds

  const generatePath = (points: HeartbeatPoint[]): string => {
    if (points.length === 0) return '';
    
    // Use linear interpolation instead of curves for sharper transitions
    return points.reduce((path: string, point: HeartbeatPoint, index: number) => {
      const x = (index / (points.length - 1)) * 100;
      // Increase the scaling factor for more dramatic peaks
      const y = 50 - (point.value * 25);
      
      if (index === 0) {
        return `M ${x},${y}`;
      }
      
      // Use linear lines for sharp transitions
      return `${path} L ${x},${y}`;
    }, '');
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Node Heartbeat: {node.ID.substring(0, 8)}
        </Typography>
        <motion.div
          animate={controls}
          style={{ 
            width: 20, 
            height: 20, 
            borderRadius: '50%', 
            backgroundColor: isHeartbeatActive ? theme.palette.success.main : theme.palette.grey[500],
            boxShadow: isHeartbeatActive 
              ? `0 0 10px ${theme.palette.success.main}` 
              : `0 0 5px ${theme.palette.grey[500]}`
          }}
        />
      </Box>
      
      <Box sx={{ height: 100, position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 15 -7
                "
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Y-axis grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={`y-${y}`}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke={theme.palette.divider}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
          {/* X-axis grid lines */}
          {[0, 20, 40, 60, 80, 100].map((x) => (
            <line
              key={`x-${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="100"
              stroke={theme.palette.divider}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
          {/* Main axes */}
          <line x1="0" y1="50" x2="100" y2="50" stroke={theme.palette.divider} strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="100" stroke={theme.palette.divider} strokeWidth="1" />
          {/* Single neon line */}
          <path
            d={generatePath(points)}
            fill="none"
            stroke="#39FF14"
            strokeWidth="0.4"
            strokeLinecap="square"
            strokeLinejoin="miter"
            filter="url(#neonGlow)"
          />
        </svg>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Last Heartbeat: {new Date(node.LastHeartbeat).toLocaleTimeString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Count: {node.HeartbeatCount}
        </Typography>
      </Box>
    </Paper>
  );
};

export default HeartbeatVisualization; 