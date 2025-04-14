# Kube-Sim
Kube-Sim is a lightweight, simulation-based distributed system that mimics core Kubernetes cluster management functionalities. Built with Go and Docker, it demonstrates key distributed computing concepts such as node addition, pod scheduling, health monitoring, and failure recovery. This project is designed for educational purposes and provides a simplified yet comprehensive platform to explore cluster management.

## Weekly Implementation Breakdown

### Week 1 (15 M)
- **API Server Base Implementation**
  - Implemented HTTP server with CORS support
  - Created node management endpoints (add, stop, restart, delete)
  - Implemented pod management endpoints (launch, delete)
  - Added heartbeat mechanism for health monitoring

- **Node Manager Functionality**
  - Added node addition with CPU core specification
  - Implemented Docker container management for nodes
  - Created node health status tracking
  - Added node resource management (CPU allocation)

### Week 2 (15 M)
- **Pod Scheduler Implementation**
  - Implemented three scheduling algorithms:
    - First-Fit: Selects the first node with sufficient resources
    - Best-Fit: Selects the node with the smallest available CPU that can accommodate the pod
    - Worst-Fit: Selects the node with the largest available CPU that can accommodate the pod
  - Added pod-to-node assignment logic
  - Implemented resource tracking and allocation
  - Enhanced scheduler with detailed logging and status reporting

- **Health Monitor**
  - Implemented node heartbeat mechanism
  - Added failure detection (15-second timeout)
  - Created automatic pod rescheduling from failed nodes
  - Implemented health status reporting

### Week 3 (10 M)
- **Node Listing and Status**
  - Implemented comprehensive node status reporting
  - Added pod-to-node relationship tracking
  - Created health status visualization
  - Implemented resource utilization reporting

- **System Testing and Documentation**
  - Added comprehensive test cases
  - Created detailed documentation
  - Implemented error handling and logging
  - Added system monitoring capabilities

### Week 4 (10 M)
- **API Enhancements**
  - Improved pod listing endpoint with detailed status information
  - Enhanced error handling and response formatting
  - Added timestamp formatting for better readability
  - Implemented proper HTTP method handling

- **CLI Improvements**
  - Added support for changing scheduling algorithms
  - Enhanced pod listing with detailed information
  - Improved error messages and user feedback
  - Added validation for command inputs

## Features
- **Node Management**: Add, stop, restart, and delete nodes with specified CPU cores
- **Pod Scheduling**: Three scheduling algorithms (First-Fit, Best-Fit, Worst-Fit)
- **Health Monitoring**: Node heartbeat mechanism with failure detection
- **Failure Recovery**: Automatic pod rescheduling from failed nodes
- **Resource Management**: CPU allocation and tracking
- **Status Reporting**: Comprehensive node and pod status information
- **Dynamic Scheduling**: Ability to change scheduling algorithms at runtime
- **Detailed Logging**: Enhanced logging for debugging and monitoring

## Project Structure
- **`api-server/`**: Core API server with scheduling and management logic
- **`node/`**: Node implementation with heartbeat mechanism
- **`cli/`**: Command-line interface for system interaction
- **`frontend/`**: Web interface for system monitoring

## System Testing

### Node Management Tests
1. **Node Addition**
   ```bash
   ./cli add-node 4
   ./cli add-node 6
   ```
   - Verify nodes are added with correct CPU cores
   - Check Docker containers are created
   - Verify heartbeat mechanism is working

2. **Node Operations**
   ```bash
   ./cli stop-node <node-id>
   ./cli restart-node <node-id>
   ./cli delete-node <node-id>
   ```
   - Verify node status changes
   - Check resource cleanup
   - Verify pod rescheduling (if applicable)

### Pod Scheduling Tests
1. **First-Fit Scheduling**
   ```bash
   ./cli set-scheduler first-fit
   ./cli launch-pod 2
   ./cli launch-pod 3
   ```
   - Verify pods are assigned to first available node
   - Check CPU allocation

2. **Best-Fit Scheduling**
   ```bash
   ./cli set-scheduler best-fit
   ./cli launch-pod 2
   ./cli launch-pod 3
   ```
   - Verify pods are assigned to node with smallest available CPU
   - Check resource utilization

3. **Worst-Fit Scheduling**
   ```bash
   ./cli set-scheduler worst-fit
   ./cli launch-pod 2
   ./cli launch-pod 3
   ```
   - Verify pods are assigned to node with largest available CPU
   - Check resource distribution

### Health Monitoring Tests
1. **Heartbeat Verification**
   ```bash
   ./cli list-nodes
   ```
   - Verify all nodes show "Healthy" status
   - Check heartbeat timestamps

2. **Failure Simulation**
   ```bash
   docker stop <node-id>
   # Wait 20 seconds
   ./cli list-nodes
   ```
   - Verify node status changes to "Failed"
   - Check pod rescheduling
   - Verify resource cleanup

### Resource Management Tests
1. **CPU Allocation**
   ```bash
   ./cli add-node 4
   ./cli launch-pod 2
   ./cli launch-pod 2
   ```
   - Verify CPU allocation is correct
   - Check resource exhaustion handling

2. **Resource Exhaustion**
   ```bash
   ./cli launch-pod 5
   ```
   - Verify error handling for insufficient resources
   - Check system stability

## Prerequisites
- **Go**: Version 1.16 or later (install from [golang.org](https://golang.org/dl/))
- **Docker**: Installed and running (install from [docker.com](https://www.docker.com/get-started))
- **Node.js and npm**: Required for frontend development

## Setup and Running the Project

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/Kube-Sim.git
cd Kube-Sim
```

### Step 2: Build the Node Docker Image
1. Navigate to the `node` directory:
   ```bash
   cd node
   ```
2. Build the Docker image:
   ```bash
   docker build -t node-image .
   ```
3. Verify the image:
   ```bash
   docker images
   ```
   You should see `node-image` listed.

### Step 3: Run the API Server
1. Navigate to the `api-server` directory:
   ```bash
   cd api-server
   ```
2. Initialize the Go module and install dependencies:
   ```bash
   go mod init api-server
   go get github.com/google/uuid
   ```
3. Build and start the API server:
   ```bash
   go build -o api-server
   ./api-server
   ```
   The server will start on `http://localhost:8080`. Keep this terminal running.

### Step 4: Build and Use the CLI
1. Open a new terminal and navigate to the `cli` directory:
   ```bash
   cd cli
   ```
2. Initialize the Go module and build the CLI:
   ```bash
   go mod init cli
   go build -o cli
   ```

### Step 5: Run the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will start on `http://localhost:3000`. Keep this terminal running.

   Note: Make sure the API server is running on port 8080 before starting the frontend.

## Usage Examples
### Basic Operations
```bash
./cli add-node 4        # Add a node with 4 CPU cores
./cli add-node 6        # Add a node with 6 CPU cores
./cli launch-pod 2      # Launch a pod requiring 2 CPU cores
./cli list-nodes        # List all nodes and their status
./cli list-pods         # List all pods and their details
```

### Scheduling Algorithm Management
```bash
./cli set-scheduler first-fit  # Switch to First-Fit scheduling
./cli set-scheduler best-fit   # Switch to Best-Fit scheduling
./cli set-scheduler worst-fit  # Switch to Worst-Fit scheduling
```

### Simulating Node Failure
1. List nodes to find a node ID:
   ```bash
   ./cli list-nodes
   ```
2. Stop a node:
   ```bash
   docker stop <node-id>
   ```
3. Wait 20 seconds, then check the status:
   ```bash
   ./cli list-nodes
   ```
   The stopped node should show as "Failed."

## Testing the System
### Node Addition Tests
- **Add valid node**: `./cli add-node 4` → Expect "Node added successfully."
- **Add invalid node**: `./cli add-node 0` → Expect error message.

### Pod Scheduling Tests
- **Launch pod**: `./cli launch-pod 2` → Expect "Pod launched successfully."
- **Exceed capacity**: `./cli launch-pod 10` → Expect "Failed to launch pod" if insufficient CPU.

### Health Monitoring Tests
- **Check node status**: `./cli list-nodes` → Verify all nodes are healthy
- **Check pod status**: `./cli list-pods` → Verify all pods are running

## Notes
- **Networking**: Uses `host.docker.internal` for simplicity. On Linux, you may need to adjust to `localhost` or use a Docker network.
- **Persistence**: State is in-memory; restarts clear the cluster.
- **Scheduling**: Implements First-Fit; extend `schedulePod` in `api-server/main.go` for Best-Fit or Worst-Fit.

## Troubleshooting
- **API Server Fails to Start**: Ensure port 8080 is free and dependencies are installed (`go get github.com/google/uuid`).
- **Node Containers Fail**: Check Docker logs (`docker logs <node-id>`) for errors.
- **CLI Errors**: Verify the API server is running at `http://localhost:8080`.

## Contributing
Feel free to fork this repository, submit issues, or propose enhancements via pull requests. Suggestions for additional features (e.g., pod health checks, persistent storage) are welcome!

## License
This project is unlicensed and free for educational use. Use at your own risk.

---

This README provides a clear guide to set up, run, and test the Guber-Netes system, making it accessible to users unfamiliar with the project. Save it as `README.md` in the root of your `Guber-Netes` directory.
