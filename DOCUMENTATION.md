# Kube-Sim Documentation

## Overview
Kube-Sim is a Kubernetes-like simulation system that demonstrates core concepts of container orchestration. It consists of three main components: an API Server, Node agents, and a CLI tool.

## Components

### API Server
The API Server is the central control plane component that manages the cluster state. It provides RESTful endpoints for:
- Node management (add, remove, restart)
- Pod scheduling and management
- Health monitoring
- Heartbeat processing

### Node Agent
The Node agent runs on each simulated node and:
- Sends regular heartbeats to the API Server
- Maintains pod state
- Reports node health status

### CLI Tool
The CLI provides a user-friendly interface to interact with the cluster:
- Node management commands
- Pod management commands
- Cluster status queries

## Commands

### Node Management
```bash
# Add a new node with specified CPU cores
cli add-node <cpuCores>

# List all nodes
cli list-nodes

# Remove a node
cli remove-node <nodeID>

# Restart a node
cli restart-node <nodeID>
```

### Pod Management
```bash
# Create a new pod
cli create-pod <cpuRequired>

# List all pods
cli list-pods

# Remove a pod
cli remove-pod <podID>

# Restart a pod
cli restart-pod <podID>
```

### Cluster Management
```bash
# Get cluster health status
cli health

# Get scheduler status
cli scheduler
```

## Environment Variables

### Node Agent
- `NODE_ID`: Unique identifier for the node
- `API_SERVER`: URL of the API Server (e.g., http://localhost:8080)

## Scheduling Algorithms
The system supports multiple scheduling algorithms:
- First-Fit: Places pods on the first node with sufficient resources
- Best-Fit: Places pods on the node with the most suitable available resources
- Worst-Fit: Places pods on the node with the most available resources

## Health Monitoring
- Nodes send heartbeats every 5 seconds
- Nodes are marked as unhealthy if no heartbeat is received for 15 seconds
- Unhealthy nodes are automatically removed from the cluster

## Error Handling
- All components include comprehensive error handling
- Failed operations are logged with detailed error messages
- Automatic retry mechanisms for transient failures

## Security
- CORS enabled for API endpoints
- Input validation for all commands
- Resource limits enforcement

## Logging
- Color-coded console output for better visibility
- Detailed logging of all operations
- Health status indicators
