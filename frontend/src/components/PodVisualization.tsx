import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Pod } from '../types';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MemoryIcon from '@mui/icons-material/Memory';

interface PodVisualizationProps {
  pod: Pod;
  onDelete: () => void;
}

const PodVisualization: React.FC<PodVisualizationProps> = ({ pod, onDelete }) => {
  const theme = useTheme();
  
  // Format the creation date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          border: `1px solid ${theme.palette.primary.main}`,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2)`,
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Pod header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RocketLaunchIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" component="div">
                Pod {pod.ID.substring(0, 8)}
              </Typography>
            </Box>
            <Chip
              label={pod.Status}
              color={
                pod.Status.toLowerCase() === 'running'
                  ? 'success'
                  : pod.Status.toLowerCase() === 'failed'
                  ? 'error'
                  : 'warning'
              }
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* Pod details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* CPU requirement */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MemoryIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
              <Typography variant="body2">
                CPU Required: <strong>{pod.CPURequired} cores</strong>
              </Typography>
            </Box>

            {/* Node assignment */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`Node: ${pod.NodeID.substring(0, 8)}`}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText,
                }}
              />
            </Box>

            {/* Creation time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(pod.CreatedAt)}
              </Typography>
            </Box>
          </Box>

          {/* Delete button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              style={{
                background: 'none',
                border: `1px solid ${theme.palette.error.main}`,
                color: theme.palette.error.main,
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.875rem',
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

export default PodVisualization; 