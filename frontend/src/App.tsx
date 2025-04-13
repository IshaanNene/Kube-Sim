import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';

import { Node, Pod } from './types';
import { api } from './services/api';
import theme from './theme';
import AnimatedBackground from './components/AnimatedBackground';
import NodeVisualization from './components/NodeVisualization';
import PodVisualization from './components/PodVisualization';
import ClusterDashboard from './components/ClusterDashboard';
import AnimatedList from './components/AnimatedList';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [pods, setPods] = useState<Record<string, Pod>>({});
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [newNodeCores, setNewNodeCores] = useState<number>(2);
  const [newPodCores, setNewPodCores] = useState<number>(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Use the imported theme instead of useTheme
  // const theme = useTheme();

  // Fetch nodes and pods
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const nodesData = await api.getNodes();
        setNodes(nodesData);
        
        // Extract pods from nodes
        const podsMap: Record<string, Pod> = {};
        Object.values(nodesData).forEach(node => {
          node.Pods.forEach(podId => {
            // Create a simple pod object for visualization
            podsMap[podId] = {
              ID: podId,
              CPURequired: 1, // Default value
              NodeID: node.ID,
              Status: 'Running',
              CreatedAt: new Date().toISOString()
            };
          });
        });
        setPods(podsMap);
        
        // Remove unused error state setting
        // setError(null);
      } catch (err: any) {
        // Use snackbar instead of error state
        setSnackbarMessage(err.message || 'Failed to fetch data');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        toast.error(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle add node
  const handleAddNode = async () => {
    try {
      if (newNodeCores <= 0) {
        toast.error('CPU cores must be a positive number');
        return;
      }
      
      await api.addNode({ cpuCores: newNodeCores });
      toast.success(`Node added with ${newNodeCores} CPU cores`);
      
      // Refresh data
      const nodesData = await api.getNodes();
      setNodes(nodesData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add node');
    }
  };

  // Handle launch pod
  const handleLaunchPod = async () => {
    try {
      if (newPodCores <= 0) {
        toast.error('CPU cores must be a positive number');
        return;
      }
      
      await api.launchPod({ cpuRequired: newPodCores });
      toast.success(`Pod launched with ${newPodCores} CPU cores`);
      
      // Refresh data
      const nodesData = await api.getNodes();
      setNodes(nodesData);
      
      // Update pods
      const podsMap: Record<string, Pod> = {};
      Object.values(nodesData).forEach(node => {
        node.Pods.forEach(podId => {
          podsMap[podId] = {
            ID: podId,
            CPURequired: newPodCores,
            NodeID: node.ID,
            Status: 'Running',
            CreatedAt: new Date().toISOString()
          };
        });
      });
      setPods(podsMap);
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch pod');
    }
  };

  // Handle stop node
  const handleStopNode = async (nodeId: string) => {
    try {
      await api.stopNode(nodeId);
      toast.info(`Node ${nodeId.substring(0, 8)} stopped`);
      
      // Refresh data
      const nodesData = await api.getNodes();
      setNodes(nodesData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to stop node');
    }
  };

  // Handle restart node
  const handleRestartNode = async (nodeId: string) => {
    try {
      await api.restartNode(nodeId);
      toast.info(`Node ${nodeId.substring(0, 8)} restarted`);
      
      // Refresh data
      const nodesData = await api.getNodes();
      setNodes(nodesData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to restart node');
    }
  };

  // Handle delete node
  const handleDeleteNode = async (nodeId: string) => {
    try {
      await api.deleteNode(nodeId);
      toast.success(`Node ${nodeId.substring(0, 8)} deleted`);
      
      // Refresh data
      const nodesData = await api.getNodes();
      setNodes(nodesData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete node');
    }
  };

  // Handle delete pod
  const handleDeletePod = async (podId: string) => {
    try {
      await api.deletePod(podId);
      toast.success(`Pod ${podId.substring(0, 8)} deleted`);
      
      // Refresh data
      const nodesData = await api.getNodes();
      setNodes(nodesData);
      
      // Update pods
      const updatedPods = { ...pods };
      delete updatedPods[podId];
      setPods(updatedPods);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete pod');
    }
  };

  // Show loading state
  if (loading && Object.keys(nodes).length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #121212 0%, #1a237e 100%)',
          }}
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatedBackground />
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'white' }}>
              Kube-Sim
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddNode}
                sx={{ fontWeight: 'bold' }}
              >
                Add Node
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<RocketLaunchIcon />}
                onClick={handleLaunchPod}
                sx={{ fontWeight: 'bold' }}
              >
                Launch Pod
              </Button>
            </Box>
          </Box>
        </motion.div>

        <Paper
          sx={{
            mb: 4,
            background: 'rgba(18, 18, 18, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(63, 81, 181, 0.3)',
            borderRadius: 2,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid rgba(63, 81, 181, 0.3)',
              '& .MuiTab-root': {
                fontWeight: 'bold',
                py: 2,
              },
            }}
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<MemoryIcon />} label="Nodes" />
            <Tab icon={<StorageIcon />} label="Pods" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <ClusterDashboard nodes={nodes} pods={pods} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Add New Node
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                  label="CPU Cores"
                  type="number"
                  value={newNodeCores}
                  onChange={(e) => setNewNodeCores(parseInt(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 200 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddNode}
                >
                  Add Node
                </Button>
              </Box>
            </Box>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Cluster Nodes
            </Typography>
            
            <AnimatedList>
              {Object.values(nodes).map((node) => (
                <NodeVisualization
                  key={node.ID}
                  node={node}
                  onStop={() => handleStopNode(node.ID)}
                  onRestart={() => handleRestartNode(node.ID)}
                  onDelete={() => handleDeleteNode(node.ID)}
                />
              ))}
            </AnimatedList>
            
            {Object.keys(nodes).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No nodes available. Add a node to get started.
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Launch New Pod
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                  label="CPU Cores"
                  type="number"
                  value={newPodCores}
                  onChange={(e) => setNewPodCores(parseInt(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 200 }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<RocketLaunchIcon />}
                  onClick={handleLaunchPod}
                >
                  Launch Pod
                </Button>
              </Box>
            </Box>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Cluster Pods
            </Typography>
            
            <AnimatedList>
              {Object.values(pods).map((pod) => (
                <PodVisualization
                  key={pod.ID}
                  pod={pod}
                  onDelete={() => handleDeletePod(pod.ID)}
                />
              ))}
            </AnimatedList>
            
            {Object.keys(pods).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No pods available. Launch a pod to get started.
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Container>
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
