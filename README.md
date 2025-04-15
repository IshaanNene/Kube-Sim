# Kube-Sim
Kube-Sim is a lightweight, simulation-based distributed system that mimics core 
Kubernetes cluster management functionalities. The system will create a simplified 
yet comprehensive platform for demonstrating key distributed computing concepts

# Dashboard
<img width="1202" alt="Screenshot 2025-04-15 at 6 28 23 PM" src="https://github.com/user-attachments/assets/dc9a4fb9-5629-4847-a82b-c91e608325d7" />
## Adding a Node
<img width="1332" alt="Screenshot 2025-04-15 at 6 32 41 PM" src="https://github.com/user-attachments/assets/83d03ed8-2f36-465c-a888-f567fdd6c88d" />
## Adding a Pod
<img width="1321" alt="Screenshot 2025-04-15 at 6 33 12 PM" src="https://github.com/user-attachments/assets/cddc088b-01b5-4534-b6e6-18c29dbce666" />
## A Working Live Monitor
<img width="978" alt="Screenshot 2025-04-15 at 6 34 29 PM" src="https://github.com/user-attachments/assets/70a7e41d-734c-4b91-8cd5-361059de30b3" />
## Stopping Node
<img width="1289" alt="Screenshot 2025-04-15 at 6 37 41 PM" src="https://github.com/user-attachments/assets/3559fef6-7d29-41e2-b6c1-bb372e5bfd89" />

# Testing
<img width="430" alt="Screenshot 2025-04-15 at 6 42 34 PM" src="https://github.com/user-attachments/assets/45e48f67-a0ab-4ca7-bdcb-95da270d916d" />
## Tests
<img width="938" alt="Screenshot 2025-04-15 at 6 45 03 PM" src="https://github.com/user-attachments/assets/1a257994-e94e-4ea9-ba7d-0cf07285c739" />
## Final Test Summary
<img width="284" alt="Screenshot 2025-04-15 at 6 44 46 PM" src="https://github.com/user-attachments/assets/036303e8-a00a-481a-9c75-f11da9a3fe5d" />


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
- **`tests/`**: For system testing

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

### Pod Management Tests
1. **Pod Creation and Deletion**
   ```bash
   # Create pods
   ./cli launch-pod 2
   ./cli launch-pod 3
   
   # List pods to get IDs
   ./cli list-pods
   
   # Delete a pod
   ./cli delete-pod <pod-id>
   ```
   - Verify pods are created with correct CPU requirements
   - Check pod status changes to "Terminated"
   - Verify pod is removed from node's pod list
   - Confirm resource cleanup

2. **Node Deletion with Pods**
   ```bash
   # List nodes to get IDs
   ./cli list-nodes
   
   # Delete a node
   ./cli delete-node <node-id>
   ```
   - Verify node is removed from cluster
   - Check pods are rescheduled to other nodes
   - Confirm resource cleanup
   - Verify heartbeat monitoring stops

3. **Cascading Deletion**
   ```bash
   # Delete a node with pods
   ./cli delete-node <node-id>
   
   # Verify pod rescheduling
   ./cli list-pods
   ```
   - Verify pods are automatically rescheduled
   - Check resource allocation on new nodes
   - Confirm no resource leaks

### Resource Cleanup Tests
1. **Multiple Pod Deletion**
   ```bash
   # Create multiple pods
   ./cli launch-pod 2
   ./cli launch-pod 2
   ./cli launch-pod 2
   
   # Delete all pods
   ./cli list-pods | grep -o '"ID":"[^"]*"' | cut -d'"' -f4 | xargs -I {} ./cli delete-pod {}
   ```
   - Verify all pods are deleted
   - Check resource cleanup
   - Confirm node status updates

2. **Node Cleanup**
   ```bash
   # Delete all nodes
   ./cli list-nodes | grep -o '"ID":"[^"]*"' | cut -d'"' -f4 | xargs -I {} ./cli delete-node {}
   ```
   - Verify all nodes are removed
   - Check Docker container cleanup
   - Confirm cluster state is empty

## Prerequisites
- **Go**: Version 1.16 or later (install from [golang.org](https://golang.org/dl/))
- **Docker**: Installed and running (install from [docker.com](https://www.docker.com/get-started))
- **Node.js and npm**: Required for frontend development

## Setup and Running the Project

### Step 1: Clone the Repository
```bash
git clone https://github.com/IshaanNene/Kube-Sim.git
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

### Resource Cleanup
```bash
# Delete a specific pod
./cli delete-pod <pod-id>

# Delete a specific node
./cli delete-node <node-id>

# Clean up all resources
./cli list-pods | grep -o '"ID":"[^"]*"' | cut -d'"' -f4 | xargs -I {} ./cli delete-pod {}
./cli list-nodes | grep -o '"ID":"[^"]*"' | cut -d'"' -f4 | xargs -I {} ./cli delete-node {}
```

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
