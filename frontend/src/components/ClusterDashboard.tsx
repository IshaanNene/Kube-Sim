import React from 'react';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Node, Pod } from '../types';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

interface ClusterDashboardProps {
  nodes: Record<string, Node>;
  pods: Record<string, Pod>;
}

const ClusterDashboard: React.FC<ClusterDashboardProps> = ({ nodes, pods }) => {
  const theme = useTheme();
  
  // Calculate cluster statistics
  const calculateStats = () => {
    const nodeIds = Object.keys(nodes);
    const podIds = Object.keys(pods);
    
    // Node statistics
    const totalNodes = nodeIds.length;
    const healthyNodes = nodeIds.filter(id => nodes[id].HealthStatus.toLowerCase() === 'healthy').length;
    const failedNodes = nodeIds.filter(id => nodes[id].HealthStatus.toLowerCase() === 'failed').length;
    const stoppedNodes = nodeIds.filter(id => nodes[id].HealthStatus.toLowerCase() === 'stopped').length;
    
    // CPU statistics
    const totalCPUCores = nodeIds.reduce((sum, id) => sum + nodes[id].CPUCores, 0);
    const availableCPUCores = nodeIds.reduce((sum, id) => sum + nodes[id].AvailableCPU, 0);
    const usedCPUCores = totalCPUCores - availableCPUCores;
    const cpuUsagePercent = totalCPUCores > 0 ? (usedCPUCores / totalCPUCores) * 100 : 0;
    
    // Pod statistics
    const totalPods = podIds.length;
    const runningPods = podIds.filter(id => pods[id].Status.toLowerCase() === 'running').length;
    const failedPods = podIds.filter(id => pods[id].Status.toLowerCase() === 'failed').length;
    
    return {
      totalNodes,
      healthyNodes,
      failedNodes,
      stoppedNodes,
      totalCPUCores,
      availableCPUCores,
      usedCPUCores,
      cpuUsagePercent,
      totalPods,
      runningPods,
      failedPods
    };
  };
  
  const stats = calculateStats();
  
  // Data for node health chart
  const nodeHealthData = [
    { name: 'Healthy', value: stats.healthyNodes, color: theme.palette.success.main },
    { name: 'Failed', value: stats.failedNodes, color: theme.palette.error.main },
    { name: 'Stopped', value: stats.stoppedNodes, color: theme.palette.warning.main }
  ];
  
  // Data for CPU usage chart
  const cpuUsageData = [
    { name: 'Used', value: stats.usedCPUCores, color: theme.palette.primary.main },
    { name: 'Available', value: stats.availableCPUCores, color: theme.palette.info.main }
  ];
  
  // Data for pod status chart
  const podStatusData = [
    { name: 'Running', value: stats.runningPods, color: theme.palette.success.main },
    { name: 'Failed', value: stats.failedPods, color: theme.palette.error.main }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Cluster Dashboard
        </Typography>
        
        {/* Summary cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: 2,
              }}
            >
              <MemoryIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.totalNodes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Nodes
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                border: `1px solid ${theme.palette.secondary.main}`,
                borderRadius: 2,
              }}
            >
              <SpeedIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.totalCPUCores}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total CPU Cores
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                border: `1px solid ${theme.palette.success.main}`,
                borderRadius: 2,
              }}
            >
              <StorageIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.totalPods}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Pods
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                border: `1px solid ${theme.palette.info.main}`,
                borderRadius: 2,
              }}
            >
              <HealthAndSafetyIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.healthyNodes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Healthy Nodes
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Node Health
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={nodeHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {nodeHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                border: `1px solid ${theme.palette.secondary.main}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                CPU Usage
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={cpuUsageData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                border: `1px solid ${theme.palette.success.main}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Pod Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={podStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {podStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default ClusterDashboard; 