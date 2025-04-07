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
  0% {
    transform: scaleY(1);
    opacity: 1;
  }
  50% {
    transform: scaleY(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
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
        background: (theme) => `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.dark, 0.2)},
          ${alpha(theme.palette.common.black, 0.9)},
          ${alpha(theme.palette.secondary.dark, 0.2)}
        )`,
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 15s ease infinite`,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => `
            radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.4)}, transparent 40%),
            radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.4)}, transparent 40%),
            radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.2)}, transparent 60%),
            radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.4)}, transparent 40%),
            radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.4)}, transparent 40%)
          `,
          opacity: 0.7,
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '200vw',
          height: '200vh',
          transform: 'translate(-50%, -50%)',
          background: (theme) => `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 4px,
              ${alpha(theme.palette.primary.main, 0.05)} 4px,
              ${alpha(theme.palette.primary.main, 0.05)} 8px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 4px,
              ${alpha(theme.palette.secondary.main, 0.05)} 4px,
              ${alpha(theme.palette.secondary.main, 0.05)} 8px
            )
          `,
          animation: `${floatingGlow} 10s ease-in-out infinite`,
          zIndex: 0,
          opacity: 0.3,
          pointerEvents: 'none',
        }
      }}>
        {/* Floating orbs with more prominent colors */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none',
          '& > div': {
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: `${floatingGlow} 10s ease-in-out infinite`,
          }
        }}>
          <Box sx={{
            top: '10%',
            left: '10%',
            width: '400px',
            height: '400px',
            background: (theme) => `radial-gradient(circle at center, 
              ${alpha(theme.palette.primary.main, 0.4)},
              ${alpha(theme.palette.primary.dark, 0.1)}
            )`,
            animationDelay: '0s',
          }} />
          <Box sx={{
            top: '60%',
            right: '10%',
            width: '350px',
            height: '350px',
            background: (theme) => `radial-gradient(circle at center, 
              ${alpha(theme.palette.secondary.main, 0.4)},
              ${alpha(theme.palette.secondary.dark, 0.1)}
            )`,
            animationDelay: '-2s',
          }} />
          <Box sx={{
            top: '40%',
            left: '60%',
            width: '300px',
            height: '300px',
            background: (theme) => `radial-gradient(circle at center, 
              ${alpha(theme.palette.primary.light, 0.3)},
              ${alpha(theme.palette.primary.dark, 0.1)}
            )`,
            animationDelay: '-4s',
          }} />
        </Box>

        <Container maxWidth="lg" sx={{ 
          position: 'relative', 
          zIndex: 2,
          '& .MuiPaper-root': {
            background: (theme) => `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.8)}, 
              ${alpha(theme.palette.background.paper, 0.6)}
            )`,
            backdropFilter: 'blur(10px)',
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
                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
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
                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
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
                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
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
              }}>
                <Typography variant="h6" color="text.secondary">
                  No nodes available. Click "Add Node" to create your first node.
                </Typography>
              </Paper>
            ) : (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  borderRadius: '12px',
                  background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  '& th': {
                    fontWeight: 'bold',
                    background: (theme) => alpha(theme.palette.background.paper, 0.5),
                  },
                  '& td': {
                    borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                  },
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
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
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
