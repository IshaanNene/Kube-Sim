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
} from '@mui/material';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { Node } from './types';
import { api } from './services/api';

function App() {
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [openNodeDialog, setOpenNodeDialog] = useState(false);
  const [openPodDialog, setOpenPodDialog] = useState(false);
  const [cpuCores, setCpuCores] = useState('');
  const [cpuRequired, setCpuRequired] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Kube-Sim Dashboard
          </Typography>

          {/* Cluster Overview Cards */}
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cluster Health</Typography>
                <Typography variant="h4" color="primary">
                  {stats.healthyNodes}/{stats.totalNodes}
                </Typography>
                <Typography variant="body2">Healthy Nodes</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>CPU Usage</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.cpuUsagePercentage} 
                    />
                  </Box>
                  <Typography variant="body2">
                    {stats.cpuUsagePercentage}%
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {stats.usedCPU}/{stats.totalCPU} CPU cores used
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
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
              sx={{ mr: 2 }}
            >
              Add Node
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenPodDialog(true)}
              disabled={stats.totalNodes === 0}
            >
              Launch Pod
            </Button>
          </Box>

          {error && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
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
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No nodes available. Click "Add Node" to create your first node.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Node ID</TableCell>
                    <TableCell>Health Status</TableCell>
                    <TableCell>CPU Usage</TableCell>
                    <TableCell>Heartbeats</TableCell>
                    <TableCell>Pods</TableCell>
                    <TableCell>Last Heartbeat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(nodes).map(([id, node]) => (
                    <TableRow 
                      key={id}
                      sx={{
                        backgroundColor: node.HealthStatus === 'Failed' ? 'error.light' : 'inherit',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <TableCell>{id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={node.HealthStatus}
                          color={getHealthStatusColor(node.HealthStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={((node.CPUCores - node.AvailableCPU) / node.CPUCores) * 100} 
                            />
                          </Box>
                          <Typography variant="body2">
                            {node.CPUCores - node.AvailableCPU}/{node.CPUCores}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{node.HeartbeatCount || 0}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${node.Pods.length} pods`}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(node.LastHeartbeat).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Add Node Dialog */}
        <Dialog open={openNodeDialog} onClose={() => setOpenNodeDialog(false)}>
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNodeDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddNode} 
              variant="contained"
              disabled={!cpuCores || parseInt(cpuCores) < 1}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Launch Pod Dialog */}
        <Dialog open={openPodDialog} onClose={() => setOpenPodDialog(false)}>
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPodDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleLaunchPod} 
              variant="contained"
              disabled={!cpuRequired || parseInt(cpuRequired) < 1}
            >
              Launch
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </CssVarsProvider>
  );
}

export default App;
