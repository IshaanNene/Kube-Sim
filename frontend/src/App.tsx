import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
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
} from '@mui/material';
import { Node } from './types';
import { api } from './services/api';

function App() {
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [openNodeDialog, setOpenNodeDialog] = useState(false);
  const [openPodDialog, setOpenPodDialog] = useState(false);
  const [cpuCores, setCpuCores] = useState('');
  const [cpuRequired, setCpuRequired] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const nodesData = await api.getNodes();
        setNodes(nodesData);
      } catch (err) {
        setError('Failed to fetch nodes');
      }
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddNode = async () => {
    try {
      await api.addNode({ cpuCores: parseInt(cpuCores) });
      setOpenNodeDialog(false);
      setCpuCores('');
    } catch (err) {
      setError('Failed to add node');
    }
  };

  const handleLaunchPod = async () => {
    try {
      await api.launchPod({ cpuRequired: parseInt(cpuRequired) });
      setOpenPodDialog(false);
      setCpuRequired('');
    } catch (err) {
      setError('Failed to launch pod');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kube-Sim Dashboard
        </Typography>

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
          >
            Launch Pod
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Node ID</TableCell>
                <TableCell>CPU Cores</TableCell>
                <TableCell>Available CPU</TableCell>
                <TableCell>Health Status</TableCell>
                <TableCell>Pods</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(nodes).map(([id, node]) => (
                <TableRow key={id}>
                  <TableCell>{id.slice(0, 8)}</TableCell>
                  <TableCell>{node.CPUCores}</TableCell>
                  <TableCell>{node.AvailableCPU}</TableCell>
                  <TableCell>
                    <Typography
                      color={node.HealthStatus === 'Healthy' ? 'success.main' : 'error.main'}
                    >
                      {node.HealthStatus}
                    </Typography>
                  </TableCell>
                  <TableCell>{node.Pods.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNodeDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNode} variant="contained">
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPodDialog(false)}>Cancel</Button>
          <Button onClick={handleLaunchPod} variant="contained">
            Launch
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
