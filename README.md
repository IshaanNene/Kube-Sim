# Kube-Sim
Kube-Sim is a lightweight, simulation-based distributed system that mimics core Kubernetes cluster management functionalities. Built with Go and Docker, it demonstrates key distributed computing concepts such as node addition, pod scheduling, health monitoring, and failure recovery. This project is designed for educational purposes and provides a simplified yet comprehensive platform to explore cluster management.

## Features
- **Node Addition**: Add nodes to the cluster with specified CPU cores, simulated using Docker containers.
- **Pod Scheduling**: Schedule pods with CPU requirements using a First-Fit algorithm (extensible to Best-Fit or Worst-Fit).
- **Health Monitoring**: Nodes send periodic heartbeats; the system detects failures and marks nodes as "Failed" if heartbeats stop.
- **Failure Recovery**: Automatically reschedules pods from failed nodes to healthy ones, if resources are available.
- **Node Listing**: View all nodes with their health status, CPU usage, and assigned pods.

## Project Structure
- **`api-server/`**: Contains the API server code (`main.go`) that manages the cluster.
- **`node/`**: Contains the node program code (`main.go`) and Dockerfile for simulating nodes.
- **`cli/`**: Contains the CLI program code (`main.go`) for interacting with the API server.

## Prerequisites
- **Go**: Version 1.16 or later (install from [golang.org](https://golang.org/dl/)).
- **Docker**: Installed and running (install from [docker.com](https://www.docker.com/get-started)).
- **Operating System**: Tested on macOS; should work on Linux and Windows with minor adjustments (e.g., Docker networking).

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
   cd ../api-server
   ```
2. Initialize the Go module and install dependencies:
   ```bash
   go mod init api-server
   go get github.com/google/uuid
   ```
3. Start the API server:
   ```bash
   go run main.go
   ```
   The server will start on `http://localhost:8080`. Keep this terminal running.

### Step 4: Build and Use the CLI
1. Open a new terminal and navigate to the `cli` directory:
   ```bash
   cd ../cli
   ```
2. Initialize the Go module and build the CLI:
   ```bash
   go mod init cli
   go build -o cli
   ```

## Usage Examples
### Basic Operations
```bash
./cli add-node 4        
./cli add-node 6         
./cli launch-pod 2      
./cli list-nodes         
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
1. Stop a node: `docker stop <node-id>`
2. Wait 20 seconds
3. Check status: `./cli list-nodes`
4. Verify pod rescheduling on remaining healthy nodes.

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
