# Kube-Sim Architecture

## System Overview
Kube-Sim is a distributed system that simulates core Kubernetes concepts. It follows a client-server architecture with a central API Server and multiple Node agents.

## Component Architecture

### API Server
- **Language**: Go
- **Responsibilities**:
  - Central state management
  - REST API endpoints
  - Pod scheduling
  - Health monitoring
  - Node management
- **Key Data Structures**:
  ```go
  type Node struct {
      ID             string
      CPUCores       int
      AvailableCPU   int
      Pods           []string
      HealthStatus   string
      LastHeartbeat  time.Time
      HeartbeatCount int
  }

  type Pod struct {
      ID          string
      CPURequired int
      NodeID      string
      Status      string
      CreatedAt   time.Time
  }

  type Scheduler struct {
      Algorithm string
      Nodes     map[string]*Node
  }
  ```

### Node Agent
- **Language**: Go
- **Responsibilities**:
  - Heartbeat management
  - Pod state maintenance
  - Health status reporting
- **Key Features**:
  - Periodic heartbeat (5-second interval)
  - Pod list synchronization
  - Environment-based configuration

### CLI Tool
- **Language**: Go
- **Responsibilities**:
  - User interaction
  - Command parsing
  - API communication
- **Features**:
  - Color-coded output
  - Command validation
  - Error handling

## Communication Flow

### Node Registration
1. Node agent starts with NODE_ID and API_SERVER environment variables
2. Sends initial heartbeat to API Server
3. API Server registers node in its state

### Pod Scheduling
1. CLI sends pod creation request to API Server
2. API Server's scheduler selects appropriate node
3. Node receives pod assignment via heartbeat response
4. Node updates its local pod list

### Health Monitoring
1. Node sends heartbeat every 5 seconds
2. API Server updates node's LastHeartbeat
3. Health monitor checks for stale heartbeats
4. Unhealthy nodes are automatically removed

## Data Flow

### State Management
- API Server maintains global state
- Nodes maintain local state
- State synchronization via heartbeats
- Eventual consistency model

### Resource Management
- CPU-based resource allocation
- Dynamic resource updates
- Resource availability tracking
- Scheduling algorithm selection

## Security Architecture
- CORS protection for API endpoints
- Input validation at all layers
- Resource limits enforcement
- Error handling and logging

## Scalability Considerations
- Stateless API endpoints
- Concurrent request handling
- Efficient resource management
- Distributed health monitoring

## Monitoring and Logging
- Color-coded console output
- Detailed operation logging
- Health status indicators
- Error tracking and reporting

## Deployment Architecture
- Containerized components
- Environment-based configuration
- Service discovery
- Health checks

## Future Considerations
- Support for additional resource types
- Enhanced scheduling algorithms
- Improved monitoring capabilities
- Extended security features
