import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  keyframes,
  useTheme,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { Node } from './types';
import { api } from './services/api';

// Define animations
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`;

// Add new animation for background
const floatingGlow = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.5;
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Add new animations
const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
`;

// Add new animation for purple orbs
const purpleGlow = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(20px, -20px) scale(1.2);
    opacity: 0.6;
  }
`;

// Add these new interfaces
interface HeartbeatPoint {
  timestamp: number;
  value: number;
}

// ECG Line Component
const ECGLine: React.FC<{ 
  isHealthy: boolean;
  lastHeartbeat: string;
  heartbeatCount: number;
}> = ({ isHealthy, lastHeartbeat, heartbeatCount }) => {
  const theme = useTheme();
  const [points, setPoints] = useState<HeartbeatPoint[]>([]);
  const [prevHeartbeatCount, setPrevHeartbeatCount] = useState(heartbeatCount);
  const maxPoints = 100;
  const timeWindow = 10000;

  useEffect(() => {
    // When heartbeat count increases, add a new peak
    if (heartbeatCount > prevHeartbeatCount) {
      setPoints(prev => {
        const now = Date.now();
        // Create a sequence of points for a single heartbeat
        const heartbeatPoints: HeartbeatPoint[] = [
          { timestamp: now, value: 0 },     // Start at baseline
          { timestamp: now + 50, value: 0.1 }, // Small bump up (P wave)
          { timestamp: now + 100, value: 0 },  // Back to baseline
          { timestamp: now + 150, value: 1 },  // Sharp spike up (QRS complex)
          { timestamp: now + 200, value: -0.5 }, // Sharp drop (S wave)
          { timestamp: now + 250, value: 0 },  // Back to baseline
          { timestamp: now + 300, value: 0.3 }, // Small bump (T wave)
          { timestamp: now + 350, value: 0 },  // Return to baseline
        ];

        const newPoints = [...prev, ...heartbeatPoints];
        // Remove points older than timeWindow
        return newPoints
          .filter(p => now - p.timestamp < timeWindow)
          .slice(-maxPoints);
      });
    }
    setPrevHeartbeatCount(heartbeatCount);

    // Cleanup old points periodically
    const interval = setInterval(() => {
      setPoints(prev => {
        const now = Date.now();
        return prev.filter(p => now - p.timestamp < timeWindow);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [heartbeatCount, prevHeartbeatCount]);

  const lastHeartbeatTime = new Date(lastHeartbeat).getTime();
  const timeSinceLastHeartbeat = Date.now() - lastHeartbeatTime;
  const isInactive = timeSinceLastHeartbeat > 20000; // Consider inactive after 20 seconds

  const generatePath = (points: HeartbeatPoint[]): string => {
    if (points.length === 0) return '';
    
    // Create a smooth path with control points
    return points.reduce((path: string, point: HeartbeatPoint, index: number) => {
      const x = (index / (points.length - 1)) * 300;
      // Scale the value to fit the SVG height (50 is center, ±30 for amplitude)
      const y = 50 - (point.value * 30);
      
      if (index === 0) {
        return `M ${x},${y}`;
      }
      
      // Use quadratic curves for smoother lines
      const prevX = ((index - 1) / (points.length - 1)) * 300;
      const prevY = 50 - (points[index - 1].value * 30);
      const cpX = (x + prevX) / 2;
      
      return `${path} Q ${cpX},${prevY} ${x},${y}`;
    }, '');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      position: 'relative',
      width: '300px',
      height: '80px',
      opacity: isInactive ? 0.3 : 1,
      backgroundColor: theme.palette.common.black,
      borderRadius: '8px',
      p: 1,
      border: '1px solid',
      borderColor: isInactive ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.success.main, 0.3),
      boxShadow: `0 0 10px ${isInactive ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.success.main, 0.2)}`,
      overflow: 'hidden',
    }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        style={{
          filter: !isInactive ? 'drop-shadow(0 0 3px #4caf50)' : 'none',
        }}
      >
        {/* Background grid lines */}
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="0.5"
            opacity="0.5"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Baseline */}
        <line
          x1="0"
          y1="50"
          x2="300"
          y2="50"
          stroke="#1a1a1a"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Real-time ECG line */}
        {points.length > 0 && (
          <>
            <path
              d={generatePath(points)}
              fill="none"
              stroke={isInactive ? '#ff5252' : '#4caf50'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glow effect */}
            <path
              d={generatePath(points)}
              fill="none"
              stroke={isInactive ? '#ff5252' : '#4caf50'}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'blur(4px)',
                opacity: 0.5,
              }}
            />
          </>
        )}
      </svg>
      <Typography 
        variant="body2" 
        sx={{ 
          position: 'absolute',
          top: 4,
          right: 8,
          color: (theme) => isInactive ? theme.palette.error.main : '#4caf50',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textShadow: !isInactive ? '0 0 10px #4caf50' : '0 0 10px #ff5252',
        }}
      >
        {isInactive ? 'INACTIVE' : 'ACTIVE'}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          position: 'absolute',
          bottom: 4,
          right: 8,
          color: '#666',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
        }}
      >
        {Math.round(timeSinceLastHeartbeat / 1000)}s ago
      </Typography>
    </Box>
  );
};

function App() {
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [openNodeDialog, setOpenNodeDialog] = useState(false);
  const [openPodDialog, setOpenPodDialog] = useState(false);
  const [cpuCores, setCpuCores] = useState('');
  const [cpuRequired, setCpuRequired] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stoppingNode, setStoppingNode] = useState<string | null>(null);
  const [deletingNode, setDeletingNode] = useState<string | null>(null);
  const [restartingNode, setRestartingNode] = useState<string | null>(null);
  const [deletingPod, setDeletingPod] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const nodesData = await api.getNodes();
        setNodes(nodesData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching nodes:', err);
        setError('Failed to fetch nodes. Please ensure the API server is running.');
        setLoading(false);
      }
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddNode = async () => {
    try {
      setError(null);
      await api.addNode({ cpuCores: parseInt(cpuCores) });
      setOpenNodeDialog(false);
      setCpuCores('');
    } catch (err) {
      console.error('Error adding node:', err);
      setError('Failed to add node. Please ensure the API server is running and Docker is available.');
    }
  };

  const handleLaunchPod = async () => {
    try {
      setError(null);
      await api.launchPod({ cpuRequired: parseInt(cpuRequired) });
      setOpenPodDialog(false);
      setCpuRequired('');
    } catch (err) {
      console.error('Error launching pod:', err);
      setError('Failed to launch pod. Please ensure there are healthy nodes with sufficient CPU.');
    }
  };

  const handleStopNode = async (nodeId: string) => {
    try {
      setStoppingNode(nodeId);
      setError(null);
      await api.stopNode(nodeId);
    } catch (err) {
      console.error('Error stopping node:', err);
      setError('Failed to stop node. Please ensure the API server is running.');
    } finally {
      setStoppingNode(null);
    }
  };

  const handleRestartNode = async (nodeId: string) => {
    try {
      setRestartingNode(nodeId);
      setError(null);
      await api.restartNode(nodeId);
    } catch (err) {
      console.error('Error restarting node:', err);
      setError('Failed to restart node. Please ensure the API server is running.');
    } finally {
      setRestartingNode(null);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      setDeletingNode(nodeId);
      setError(null);

      // Immediately remove from frontend state
      setNodes(prevNodes => {
        const newNodes = { ...prevNodes };
        delete newNodes[nodeId];
        return newNodes;
      });

      // Then try to delete from backend
      await api.deleteNode(nodeId);
    } catch (err: any) {
      console.error('Error deleting node:', err);
      // Even if the API call fails, we keep the node removed from the frontend
      // since it's in a Failed state anyway
    } finally {
      setDeletingNode(null);
    }
  };

  const handleDeletePod = async (podId: string) => {
    try {
      setDeletingPod(podId);
      setError(null);
      await api.deletePod(podId);
    } catch (err) {
      console.error('Error deleting pod:', err);
      setError('Failed to delete pod. Please ensure the API server is running.');
    } finally {
      setDeletingPod(null);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'success';
      case 'Failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  const calculateClusterStats = () => {
    let totalCPU = 0;
    let usedCPU = 0;
    let healthyNodes = 0;
    let totalPods = 0;

    Object.values(nodes).forEach(node => {
      totalCPU += node.CPUCores;
      usedCPU += (node.CPUCores - node.AvailableCPU);
      if (node.HealthStatus === 'Healthy') healthyNodes++;
      totalPods += node.Pods.length;
    });

    return {
      totalCPU,
      usedCPU,
      healthyNodes,
      totalNodes: Object.keys(nodes).length,
      totalPods,
      cpuUsagePercentage: totalCPU > 0 ? Math.round((usedCPU / totalCPU) * 100) : 0
    };
  };

  const stats = calculateClusterStats();

  return (
    <CssVarsProvider>
      <Box sx={{
        minHeight: '100vh',
        position: 'relative',
        background: '#f8f9fa',
        overflow: 'hidden',
      }}>
        {/* Background Elements */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}>
          {/* Blue Orbs */}
          {[...Array(3)].map((_, i) => (
            <Box
              key={`blue-orb-${i}`}
              sx={{
                position: 'absolute',
                width: ['600px', '700px', '800px'][i],
                height: ['600px', '700px', '800px'][i],
                background: [
                  `radial-gradient(circle at center, 
                    rgba(59, 130, 246, 0.4),
                    rgba(37, 99, 235, 0.3),
                    rgba(29, 78, 216, 0.2)
                  )`,
                  `radial-gradient(circle at center, 
                    rgba(96, 165, 250, 0.4),
                    rgba(59, 130, 246, 0.3),
                    rgba(37, 99, 235, 0.2)
                  )`,
                  `radial-gradient(circle at center, 
                    rgba(147, 197, 253, 0.4),
                    rgba(96, 165, 250, 0.3),
                    rgba(59, 130, 246, 0.2)
                  )`
                ][i],
                borderRadius: '50%',
                filter: 'blur(100px)',
                animation: `${purpleGlow} ${15 + i * 2}s ease-in-out infinite`,
                animationDelay: `${-i * 3}s`,
                opacity: 0.5,
                top: ['20%', '60%', '40%'][i],
                left: ['20%', '60%', '40%'][i],
              }}
            />
          ))}

          {/* Purple Orbs */}
          {[...Array(3)].map((_, i) => (
            <Box
              key={`purple-orb-${i}`}
              sx={{
                position: 'absolute',
                width: ['500px', '600px', '700px'][i],
                height: ['500px', '600px', '700px'][i],
                background: [
                  `radial-gradient(circle at center, 
                    rgba(216, 180, 254, 0.4),
                    rgba(192, 132, 252, 0.3),
                    rgba(168, 85, 247, 0.2)
                  )`,
                  `radial-gradient(circle at center, 
                    rgba(192, 132, 252, 0.4),
                    rgba(168, 85, 247, 0.3),
                    rgba(147, 51, 234, 0.2)
                  )`,
                  `radial-gradient(circle at center, 
                    rgba(233, 213, 255, 0.4),
                    rgba(216, 180, 254, 0.3),
                    rgba(192, 132, 252, 0.2)
                  )`
                ][i],
                borderRadius: '50%',
                filter: 'blur(100px)',
                animation: `${purpleGlow} ${15 + i * 2}s ease-in-out infinite`,
                animationDelay: `${-i * 3}s`,
                opacity: 0.5,
                top: ['30%', '70%', '50%'][i],
                left: ['70%', '30%', '50%'][i],
              }}
            />
          ))}

          {/* Floating Elements with mixed theme */}
          {[...Array(8)].map((_, i) => (
            <Box
              key={`float-${i}`}
              sx={{
                position: 'absolute',
                width: ['150px', '180px', '200px', '220px'][i % 4],
                height: ['150px', '180px', '200px', '220px'][i % 4],
                background: [
                  `radial-gradient(circle at center, 
                    rgba(147, 197, 253, 0.5),
                    rgba(96, 165, 250, 0.4),
                    rgba(59, 130, 246, 0.3)
                  )`,
                  `radial-gradient(circle at center, 
                    rgba(216, 180, 254, 0.5),
                    rgba(192, 132, 252, 0.4),
                    rgba(168, 85, 247, 0.3)
                  )`,
                  `radial-gradient(circle at center, 
                    rgba(96, 165, 250, 0.5),
                    rgba(59, 130, 246, 0.4),
                    rgba(37, 99, 235, 0.3)
                  )`,
                  `radial-gradient(circle at center, 
                    rgba(192, 132, 252, 0.5),
                    rgba(168, 85, 247, 0.4),
                    rgba(147, 51, 234, 0.3)
                  )`
                ][i % 4],
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: `${float} ${12 + i * 2}s ease-in-out infinite`,
                animationDelay: `${-i * 1.5}s`,
                opacity: 0.4,
                top: ['20%', '35%', '50%', '65%', '80%', '25%', '70%', '40%'][i],
                left: ['25%', '40%', '55%', '70%', '30%', '65%', '45%', '80%'][i],
              }}
            />
          ))}

          {/* Glowing Lines with mixed colors */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={`line-${i}`}
              sx={{
                position: 'absolute',
                width: '3px',
                height: ['300px', '400px', '500px', '400px', '350px', '450px'][i],
                background: [
                  `linear-gradient(to bottom, transparent, rgba(96, 165, 250, 0.6), rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.6), transparent)`,
                  `linear-gradient(to bottom, transparent, rgba(192, 132, 252, 0.6), rgba(168, 85, 247, 0.8), rgba(147, 51, 234, 0.6), transparent)`,
                  `linear-gradient(to bottom, transparent, rgba(147, 197, 253, 0.6), rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.6), transparent)`,
                  `linear-gradient(to bottom, transparent, rgba(216, 180, 254, 0.6), rgba(192, 132, 252, 0.8), rgba(168, 85, 247, 0.6), transparent)`,
                  `linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.6), rgba(37, 99, 235, 0.8), rgba(29, 78, 216, 0.6), transparent)`,
                  `linear-gradient(to bottom, transparent, rgba(168, 85, 247, 0.6), rgba(147, 51, 234, 0.8), rgba(126, 34, 206, 0.6), transparent)`
                ][i],
                filter: 'blur(12px)',
                animation: `${pulse} ${10 + i * 2}s ease-in-out infinite`,
                animationDelay: `${-i * 1.5}s`,
                top: ['10%', '20%', '15%', '25%', '30%', '5%'][i],
                left: ['20%', '40%', '60%', '80%', '30%', '70%'][i],
                transform: `rotate(${[15, -20, 25, -15, 20, -25][i]}deg)`,
              }}
            />
          ))}

        </Box>

        {/* Content Container with light theme glassmorphism */}
        <Container maxWidth="lg" sx={{ 
          position: 'relative', 
          zIndex: 2,
          '& .MuiPaper-root': {
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(147, 197, 253, 0.15)',
            '&:hover': {
              boxShadow: '0 8px 32px rgba(147, 197, 253, 0.25)',
              borderImage: 'linear-gradient(45deg, rgba(96, 165, 250, 0.4), rgba(168, 85, 247, 0.4)) 1',
            }
          },
          '& .MuiButton-contained': {
            background: 'linear-gradient(45deg, rgba(96, 165, 250, 0.9), rgba(168, 85, 247, 0.9))',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(147, 197, 253, 0.2)',
            '&:hover': {
              background: 'linear-gradient(45deg, rgba(96, 165, 250, 1), rgba(168, 85, 247, 1))',
              boxShadow: '0 4px 12px rgba(147, 197, 253, 0.4)',
            }
          }
        }}>
          <Box sx={{ 
            py: 4,
            position: 'relative',
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 'bold',
                background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 4,
                textAlign: 'center',
                textShadow: '0 0 20px rgba(0,0,0,0.1)',
              }}
            >
            Kube-Sim Dashboard
          </Typography>

          {/* Cluster Overview Cards */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
              <Card sx={{ 
                flex: 1,
                background: 'rgba(255, 255, 255, 0.85) !important',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(96, 165, 250, 0.3) !important',
                borderRadius: '16px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(96, 165, 250, 0.2) !important',
                  border: '2px solid rgba(96, 165, 250, 0.5) !important',
                },
                '& .MuiTypography-h6': {
                  color: '#1a1a1a',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '2px solid rgba(96, 165, 250, 0.4)',
                  display: 'inline-block',
                  marginBottom: '16px',
                  background: 'rgba(96, 165, 250, 0.1)',
                }
              }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cluster Health</Typography>
                  <Typography variant="h4" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stats.healthyNodes}/{stats.totalNodes}
                </Typography>
                <Typography variant="body2">Healthy Nodes</Typography>
              </CardContent>
            </Card>
              <Card sx={{ 
                flex: 1,
                background: 'rgba(255, 255, 255, 0.85) !important',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(168, 85, 247, 0.3) !important',
                borderRadius: '16px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(168, 85, 247, 0.2) !important',
                  border: '2px solid rgba(168, 85, 247, 0.5) !important',
                },
                '& .MuiTypography-h6': {
                  color: '#1a1a1a',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '2px solid rgba(168, 85, 247, 0.4)',
                  display: 'inline-block',
                  marginBottom: '16px',
                  background: 'rgba(168, 85, 247, 0.1)',
                }
              }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>CPU Usage</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1, position: 'relative' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.cpuUsagePercentage} 
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: (theme) => `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)})`,
                            animation: `${slideOut} 2s linear infinite`,
                          }
                        }}
                    />
                  </Box>
                    <Typography variant="body2" sx={{ minWidth: '45px' }}>
                    {stats.cpuUsagePercentage}%
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {stats.usedCPU}/{stats.totalCPU} CPU cores used
                </Typography>
              </CardContent>
            </Card>
              <Card sx={{ 
                flex: 1,
                background: 'rgba(255, 255, 255, 0.85) !important',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(147, 197, 253, 0.3) !important',
                borderRadius: '16px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(147, 197, 253, 0.2) !important',
                  border: '2px solid rgba(147, 197, 253, 0.5) !important',
                },
                '& .MuiTypography-h6': {
                  color: '#1a1a1a',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '2px solid rgba(147, 197, 253, 0.4)',
                  display: 'inline-block',
                  marginBottom: '16px',
                  background: 'rgba(147, 197, 253, 0.1)',
                }
              }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Running Pods</Typography>
                <Typography variant="h4" color="primary">
                  {stats.totalPods}
                </Typography>
                <Typography variant="body2">Total Pods</Typography>
              </CardContent>
            </Card>
          </Stack>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => setOpenNodeDialog(true)}
                sx={{ 
                  mr: 2,
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 3,
                }}
                startIcon={<AddCircleOutlineIcon />}
            >
              Add Node
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenPodDialog(true)}
              disabled={stats.totalNodes === 0}
                sx={{ 
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 3,
                }}
                startIcon={<RocketLaunchIcon />}
            >
              Launch Pod
            </Button>
          </Box>

          {error && (
              <Paper 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: 'error.light',
                  borderRadius: '12px',
                  animation: `${pulse} 2s ease-in-out`,
                }}
              >
              <Typography color="error">
                {error}
              </Typography>
            </Paper>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : stats.totalNodes === 0 ? (
              <Paper sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: '12px',
                background: (theme) => alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                '& .MuiTypography-root': {
                  color: 'white',
                }
              }}>
                <Typography variant="h6">
                No nodes available. Click "Add Node" to create your first node.
              </Typography>
            </Paper>
          ) : (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.85) !important',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(96, 165, 250, 0.3) !important',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(96, 165, 250, 0.2) !important',
                    border: '2px solid rgba(96, 165, 250, 0.5) !important',
                  },
                  '& th': {
                    fontWeight: 'bold',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#1a1a1a',
                    borderBottom: '2px solid rgba(96, 165, 250, 0.2)',
                    '& .MuiTypography-root': {
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '2px solid rgba(96, 165, 250, 0.4)',
                      display: 'inline-block',
                      background: 'rgba(96, 165, 250, 0.1)',
                    }
                  },
                  '& td': {
                    borderColor: 'rgba(96, 165, 250, 0.1)',
                    color: '#1a1a1a',
                  },
                  '& tr:hover': {
                    backgroundColor: 'rgba(96, 165, 250, 0.05) !important',
                  },
                  '& .MuiChip-root': {
                    borderRadius: '8px',
                    border: '1px solid rgba(147, 197, 253, 0.4)',
                    background: 'rgba(147, 197, 253, 0.1)',
                  },
                  '& .MuiButton-root': {
                    borderRadius: '12px',
                  },
                  '& .MuiIconButton-root': {
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Node ID</TableCell>
                    <TableCell>Health Status</TableCell>
                    <TableCell>CPU Usage</TableCell>
                      <TableCell>Heartbeat</TableCell>
                    <TableCell>Pods</TableCell>
                    <TableCell>Last Heartbeat</TableCell>
                      <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(nodes).map(([id, node]) => (
                      <React.Fragment key={id}>
                    <TableRow 
                      sx={{
                        backgroundColor: node.HealthStatus === 'Failed' ? 'error.light' : 'inherit',
                            '&:hover': { 
                              backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.1),
                              backdropFilter: 'blur(10px)',
                            }
                      }}
                    >
                      <TableCell>{id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={node.HealthStatus}
                          color={getHealthStatusColor(node.HealthStatus)}
                          size="small"
                              sx={{ borderRadius: '8px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={((node.CPUCores - node.AvailableCPU) / node.CPUCores) * 100} 
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 4,
                                    }
                                  }}
                            />
                          </Box>
                              <Typography variant="body2" sx={{ minWidth: '70px' }}>
                            {node.CPUCores - node.AvailableCPU}/{node.CPUCores}
                          </Typography>
                        </Box>
                      </TableCell>
                          <TableCell>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              p: 1,
                              borderRadius: '8px',
                            }}>
                              <ECGLine 
                                isHealthy={node.HealthStatus === 'Healthy'} 
                                lastHeartbeat={node.LastHeartbeat}
                                heartbeatCount={node.HeartbeatCount || 0}
                              />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: (theme) => node.HealthStatus === 'Healthy' 
                                    ? '#4caf50'
                                    : theme.palette.text.disabled,
                                  fontFamily: 'monospace',
                                  fontWeight: 'bold',
                                  fontSize: '1.2rem',
                                  textShadow: (theme) => node.HealthStatus === 'Healthy' 
                                    ? '0 0 10px #4caf50' 
                                    : 'none',
                                }}
                              >
                                {node.HeartbeatCount || 0}
                              </Typography>
                            </Box>
                          </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${node.Pods.length} pods`}
                          color="primary"
                          size="small"
                              sx={{ borderRadius: '8px' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(node.LastHeartbeat).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title={node.Pods.length > 0 ? "Cannot stop node with running pods" : "Stop Node"}>
                                <span>
                                  <IconButton 
                                    onClick={() => handleStopNode(id)}
                                    disabled={stoppingNode === id || node.Pods.length > 0 || node.HealthStatus === 'Failed'}
                                    color="warning"
                                    sx={{
                                      '&:not(:disabled):hover': {
                                        backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
                                      }
                                    }}
                                  >
                                    {stoppingNode === id ? (
                                      <CircularProgress size={24} />
                                    ) : (
                                      <StopIcon />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={node.Pods.length > 0 ? "Cannot restart node with running pods" : "Restart Node"}>
                                <span>
                                  <IconButton 
                                    onClick={() => handleRestartNode(id)}
                                    disabled={restartingNode === id || node.Pods.length > 0}
                                    color="info"
                                    sx={{
                                      '&:not(:disabled):hover': {
                                        backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
                                      }
                                    }}
                                  >
                                    {restartingNode === id ? (
                                      <CircularProgress size={24} />
                                    ) : (
                                      <RestartAltIcon />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={
                                node.Pods.length > 0 
                                  ? "Cannot delete node with running pods" 
                                  : node.HealthStatus !== 'Failed' 
                                    ? "Stop the node before deleting" 
                                    : "Delete Node"
                              }>
                                <span>
                                  <IconButton 
                                    onClick={() => handleDeleteNode(id)}
                                    disabled={
                                      deletingNode === id || 
                                      node.Pods.length > 0 || 
                                      node.HealthStatus !== 'Failed'
                                    }
                                    color="error"
                                    sx={{
                                      '&:not(:disabled):hover': {
                                        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                                      }
                                    }}
                                  >
                                    {deletingNode === id ? (
                                      <CircularProgress size={24} />
                                    ) : (
                                      <DeleteIcon />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                        {node.Pods.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ py: 0 }}>
                              <Box sx={{ pl: 4, py: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Running Pods:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {node.Pods.map((podId) => (
                                    <Chip
                                      key={podId}
                                      label={podId.slice(0, 8)}
                                      onDelete={() => handleDeletePod(podId)}
                                      color="primary"
                                      size="small"
                                      sx={{ borderRadius: '8px' }}
                                      disabled={deletingPod === podId}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                      </TableCell>
                    </TableRow>
                        )}
                      </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Add Node Dialog */}
          <Dialog 
            open={openNodeDialog} 
            onClose={() => setOpenNodeDialog(false)}
            PaperProps={{
              sx: {
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(168, 85, 247, 0.3)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.15)',
                '& .MuiDialogTitle-root': {
                  color: '#1a1a1a',
                  borderBottom: '2px solid rgba(168, 85, 247, 0.1)',
                  '& .MuiTypography-root': {
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(168, 85, 247, 0.4)',
                    display: 'inline-block',
                    background: 'rgba(168, 85, 247, 0.1)',
                  }
                },
                '& .MuiDialogContent-root': {
                  color: '#1a1a1a',
                  padding: '24px',
                },
                '& .MuiInputLabel-root': {
                  color: '#1a1a1a',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(147, 197, 253, 0.4)',
                  background: 'rgba(147, 197, 253, 0.1)',
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  color: '#1a1a1a',
                  '& fieldset': {
                    borderColor: 'rgba(168, 85, 247, 0.3)',
                    borderRadius: '12px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(168, 85, 247, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(168, 85, 247, 0.7)',
                  }
                },
                '& .MuiButton-root': {
                  borderRadius: '12px',
                  margin: '8px',
                },
                '& .MuiDialogActions-root': {
                  padding: '16px 24px',
                  borderTop: '2px solid rgba(168, 85, 247, 0.1)',
                }
              }
            }}
          >
          <DialogTitle>Add New Node</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="CPU Cores"
              type="number"
              fullWidth
              value={cpuCores}
              onChange={(e) => setCpuCores(e.target.value)}
              inputProps={{ min: 1 }}
              helperText="Enter the number of CPU cores (minimum 1)"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
            />
          </DialogContent>
          <DialogActions>
              <Button 
                onClick={() => setOpenNodeDialog(false)}
                sx={{ borderRadius: '20px', textTransform: 'none' }}
              >
                Cancel
              </Button>
            <Button 
              onClick={handleAddNode} 
              variant="contained"
              disabled={!cpuCores || parseInt(cpuCores) < 1}
                sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
                Add Node
            </Button>
          </DialogActions>
        </Dialog>

        {/* Launch Pod Dialog */}
          <Dialog 
            open={openPodDialog} 
            onClose={() => setOpenPodDialog(false)}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
              }
            }}
          >
          <DialogTitle>Launch New Pod</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="CPU Required"
              type="number"
              fullWidth
              value={cpuRequired}
              onChange={(e) => setCpuRequired(e.target.value)}
              inputProps={{ min: 1 }}
              helperText="Enter the required CPU cores (minimum 1)"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
            />
          </DialogContent>
          <DialogActions>
              <Button 
                onClick={() => setOpenPodDialog(false)}
                sx={{ borderRadius: '20px', textTransform: 'none' }}
              >
                Cancel
              </Button>
            <Button 
              onClick={handleLaunchPod} 
              variant="contained"
              disabled={!cpuRequired || parseInt(cpuRequired) < 1}
                sx={{ borderRadius: '20px', textTransform: 'none' }}
                startIcon={<RocketLaunchIcon />}
            >
                Launch Pod
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      </Box>
    </CssVarsProvider>
  );
}

export default App;
