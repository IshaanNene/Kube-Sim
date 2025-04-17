import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import { debounce } from 'lodash';

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

// Confirmation dialog props
interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationDialog({ open, title, message, onConfirm, onCancel }: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}

function App() {
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [pods, setPods] = useState<Record<string, Pod>>({});
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [newNodeCores, setNewNodeCores] = useState<number>(2);
  const [newPodCores, setNewPodCores] = useState<number>(1);
  const [schedulerAlgorithm, setSchedulerAlgorithm] = useState<string>('first-fit');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  // Memoized API calls
  const fetchData = useCallback(async () => {
    try {
      const nodesData = await api.getNodes();
      setNodes(nodesData);
      
      // Extract pods from nodes
      const podsMap: Record<string, Pod> = {};
      Object.values(nodesData).forEach(node => {
        node.Pods.forEach(podId => {
          podsMap[podId] = {
            ID: podId,
            CPURequired: 1,
            NodeID: node.ID,
            Status: 'Running',
            CreatedAt: new Date().toISOString()
          };
        });
      });
      setPods(podsMap);
    } catch (err: any) {
      setSnackbarMessage(err.message || 'Failed to fetch data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      toast.error(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch data
  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 1000),
    [fetchData]
  );

  useEffect(() => {
    fetchData();
    const interval = setInterval(debouncedFetchData, 10000); // Reduced polling frequency to 10 seconds
    return () => {
      clearInterval(interval);
      debouncedFetchData.cancel();
    };
  }, [debouncedFetchData]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleAddNode = useCallback(async () => {
    try {
      if (newNodeCores <= 0) {
        toast.error('CPU cores must be a positive number');
        return;
      }
      
      await api.addNode({ cpuCores: newNodeCores });
      toast.success(`Node added with ${newNodeCores} CPU cores`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add node');
    }
  }, [newNodeCores, fetchData]);

  const handleLaunchPod = useCallback(async () => {
    try {
      if (newPodCores <= 0) {
        toast.error('CPU cores must be a positive number');
        return;
      }
      
      await api.launchPod({ cpuRequired: newPodCores });
      toast.success(`Pod launched with ${newPodCores} CPU cores`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch pod');
    }
  }, [newPodCores, fetchData]);

  const handleStopNode = useCallback((nodeId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Stop Node',
      message: `Are you sure you want to stop node ${nodeId.substring(0, 8)}?`,
      onConfirm: async () => {
        try {
          await api.stopNode(nodeId);
          toast.info(`Node ${nodeId.substring(0, 8)} stopped`);
          await fetchData();
        } catch (err: any) {
          toast.error(err.message || 'Failed to stop node');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  }, [fetchData]);

  const handleRestartNode = useCallback((nodeId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Restart Node',
      message: `Are you sure you want to restart node ${nodeId.substring(0, 8)}?`,
      onConfirm: async () => {
        try {
          await api.restartNode(nodeId);
          toast.info(`Node ${nodeId.substring(0, 8)} restarted`);
          await fetchData();
        } catch (err: any) {
          toast.error(err.message || 'Failed to restart node');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  }, [fetchData]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Node',
      message: `Are you sure you want to delete node ${nodeId.substring(0, 8)}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.deleteNode(nodeId);
          toast.success(`Node ${nodeId.substring(0, 8)} deleted`);
          await fetchData();
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete node');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  }, [fetchData]);

  const handleDeletePod = useCallback((podId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Pod',
      message: `Are you sure you want to delete pod ${podId.substring(0, 8)}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.deletePod(podId);
          toast.success(`Pod ${podId.substring(0, 8)} deleted`);
          await fetchData();
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete pod');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  }, [fetchData]);

  const handleRestartPod = useCallback((podId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Restart Pod',
      message: `Are you sure you want to restart pod ${podId.substring(0, 8)}?`,
      onConfirm: async () => {
        try {
          await api.restartPod(podId);
          toast.info(`Pod ${podId.substring(0, 8)} restart initiated`);
          const updatedPods = { ...pods };
          if (updatedPods[podId]) {
            updatedPods[podId].Status = 'Restarting';
            setPods(updatedPods);
          }
          await fetchData();
        } catch (err: any) {
          toast.error(err.message || 'Failed to restart pod');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  }, [fetchData, pods]);

  const handleSchedulerChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newAlgorithm = event.target.value;
      await api.setScheduler(newAlgorithm);
      setSchedulerAlgorithm(newAlgorithm);
      toast.success(`Scheduler algorithm updated to ${newAlgorithm}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update scheduler algorithm');
    }
  }, []);

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
                <TextField
                  select
                  label="Scheduling Algorithm"
                  value={schedulerAlgorithm}
                  onChange={handleSchedulerChange}
                  sx={{ width: 200 }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="first-fit">First Fit</option>
                  <option value="best-fit">Best Fit</option>
                  <option value="worst-fit">Worst Fit</option>
                  <option value="round-robin">Round Robin</option>
                  <option value="most-pods">Most Pods</option>
                  <option value="least-pods">Least Pods</option>
                </TextField>
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
                  onRestart={() => handleRestartPod(pod.ID)}
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
      
      <ConfirmationDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
      
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
