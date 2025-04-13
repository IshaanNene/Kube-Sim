import React from 'react';
import { Box, Typography, Chip, LinearProgress, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Node } from '../types';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';

interface NodeVisualizationProps {
  node: Node;
  onStop: () => void;
  onRestart: () => void;
  onDelete: () => void;
}

const NodeVisualization: React.FC<NodeVisualizationProps> = ({
  node,
  onStop,
  onRestart,
  onDelete,
}) => {
  const theme = useTheme();
  
  // Calculate CPU usage percentage
  const cpuUsagePercent = ((node.CPUCores - node.AvailableCPU) / node.CPUCores) * 100;
  
  // Get health status color
  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return theme.palette.success.main;
      case 'failed':
        return theme.palette.error.main;
      case 'stopped':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 2,
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            zIndex: -1,
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${getHealthColor(node.HealthStatus)}, transparent)`,
            animation: 'pulse 2s infinite',
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Node header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MemoryIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" component="div">
                Node {node.ID.substring(0, 8)}
              </Typography>
            </Box>
            <Chip
              label={node.HealthStatus}
              color={
                node.HealthStatus.toLowerCase() === 'healthy'
                  ? 'success'
                  : node.HealthStatus.toLowerCase() === 'failed'
                  ? 'error'
                  : 'warning'
              }
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* CPU usage */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
                <Typography variant="body2">CPU Usage</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {cpuUsagePercent.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={cpuUsagePercent}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.background.paper,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                },
              }}
            />
          </Box>

          {/* Pods */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <StorageIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
              <Typography variant="body2">Pods</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {node.Pods.length > 0 ? (
                node.Pods.map((pod) => (
                  <Chip
                    key={pod}
                    label={pod.substring(0, 8)}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.primary.dark,
                      color: theme.palette.primary.contrastText,
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pods running
                </Typography>
              )}
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStop}
              style={{
                background: 'none',
                border: `1px solid ${theme.palette.warning.main}`,
                color: theme.palette.warning.main,
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Stop
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              style={{
                background: 'none',
                border: `1px solid ${theme.palette.info.main}`,
                color: theme.palette.info.main,
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Restart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              style={{
                background: 'none',
                border: `1px solid ${theme.palette.error.main}`,
                color: theme.palette.error.main,
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Delete
            </motion.button>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default NodeVisualization; 