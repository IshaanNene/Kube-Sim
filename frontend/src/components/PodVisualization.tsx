import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Tooltip,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import { motion } from 'framer-motion';
import { Pod } from '../types';

interface PodVisualizationProps {
  pod: Pod;
  onDelete: () => void;
  onRestart: () => void;
}

const PodVisualization: React.FC<PodVisualizationProps> = ({
  pod,
  onDelete,
  onRestart,
}) => {
  // Format the creation time
  const createdAt = new Date(pod.CreatedAt).toLocaleString();

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return '#4caf50';
      case 'Failed':
        return '#f44336';
      case 'Pending':
        return '#ff9800';
      case 'Restarting':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 2,
          background: 'rgba(30, 30, 30, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Pod {pod.ID.substring(0, 8)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={pod.Status}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(pod.Status),
                    color: 'white',
                  }}
                />
                <Tooltip title="CPU Cores Required">
                  <Chip
                    icon={<MemoryIcon />}
                    label={`${pod.CPURequired} CPU`}
                    size="small"
                    color="primary"
                  />
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StorageIcon fontSize="small" />
                Node: {pod.NodeID.substring(0, 8)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Created: {createdAt}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'flex-end', height: '100%' }}>
              <Button
                size="small"
                variant="outlined"
                color="info"
                startIcon={<RestartAltIcon />}
                onClick={onRestart}
                disabled={pod.Status === 'Restarting'}
              >
                Restart
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
              >
                Delete
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default PodVisualization; 