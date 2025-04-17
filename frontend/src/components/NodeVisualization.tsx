import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  LinearProgress,
  Tooltip,
  Chip,
  Grid,
} from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { Node } from '../types';

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
  // Calculate CPU usage percentage
  const cpuUsagePercent = ((node.CPUCores - node.AvailableCPU) / node.CPUCores) * 100;
  const cpuUsed = node.CPUCores - node.AvailableCPU;

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return '#4caf50';
      case 'Failed':
        return '#f44336';
      case 'Starting':
        return '#ff9800';
      case 'Stopped':
        return '#9e9e9e';
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
                Node {node.ID.substring(0, 8)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={node.HealthStatus}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(node.HealthStatus),
                    color: 'white',
                  }}
                />
                <Chip
                  label={`${node.Pods.length} Pods`}
                  size="small"
                  color="primary"
                />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                CPU Usage: {cpuUsed} / {node.CPUCores} cores ({cpuUsagePercent.toFixed(1)}%)
              </Typography>
              <Tooltip title={`${cpuUsagePercent.toFixed(1)}% CPU Used`}>
                <LinearProgress
                  variant="determinate"
                  value={cpuUsagePercent}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: cpuUsagePercent > 90 ? '#f44336' : '#4caf50',
                    },
                  }}
                />
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Available CPU: {node.AvailableCPU} cores
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Used CPU: {cpuUsed} cores
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total CPU: {node.CPUCores} cores
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Pod IDs:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {node.Pods.length > 0 ? (
                  node.Pods.map((podId) => (
                    <Chip
                      key={podId}
                      label={podId.substring(0, 8)}
                      size="small"
                      sx={{ bgcolor: 'rgba(63, 81, 181, 0.2)' }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No pods running
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<StopIcon />}
                onClick={onStop}
                disabled={node.HealthStatus === 'Stopped'}
              >
                Stop
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="info"
                startIcon={<RestartAltIcon />}
                onClick={onRestart}
                disabled={node.HealthStatus === 'Starting'}
              >
                Restart
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
                disabled={node.Pods.length > 0}
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

export default NodeVisualization; 