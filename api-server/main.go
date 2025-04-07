package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

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

var (
	nodes     = make(map[string]*Node)
	pods      = make(map[string]*Pod)
	nodesMu   sync.Mutex
	podsMu    sync.Mutex
	scheduler = "first-fit"
)

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func main() {
	log.SetFlags(log.Ldate | log.Ltime | log.Lmicroseconds)
	log.Println("Starting Kube-Sim API Server...")

	http.HandleFunc("/nodes", enableCORS(handleNodes))
	http.HandleFunc("/nodes/", enableCORS(handleNodeOperations))
	http.HandleFunc("/pods", enableCORS(handlePods))
	http.HandleFunc("/pods/", enableCORS(handlePodOperations))
	http.HandleFunc("/heartbeat", enableCORS(handleHeartbeat))

	go healthMonitor()

	log.Println("API Server listening on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed:", err)
	}
}

func handleNodes(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		var req struct {
			CPUCores int `json:"cpuCores"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		if req.CPUCores <= 0 {
			http.Error(w, "CPU cores must be positive", http.StatusBadRequest)
			return
		}

		nodeID := uuid.New().String()
		cmd := exec.Command("docker", "run", "-d", "--name", nodeID,
			"-e", "NODE_ID="+nodeID,
			"-e", "API_SERVER=http://host.docker.internal:8080",
			"node-image")
		if err := cmd.Run(); err != nil {
			http.Error(w, "Failed to launch node", http.StatusInternalServerError)
			return
		}

		nodesMu.Lock()
		nodes[nodeID] = &Node{
			ID:             nodeID,
			CPUCores:       req.CPUCores,
			AvailableCPU:   req.CPUCores,
			Pods:           []string{},
			HealthStatus:   "Healthy",
			LastHeartbeat:  time.Now(),
			HeartbeatCount: 0,
		}
		nodesMu.Unlock()

		log.Printf("Node %s added with %d CPU cores\n", nodeID, req.CPUCores)
		w.WriteHeader(http.StatusCreated)
		fmt.Fprintf(w, "Node %s added with %d CPU cores\n", nodeID, req.CPUCores)

	case "GET":
		nodesMu.Lock()
		defer nodesMu.Unlock()
		if err := json.NewEncoder(w).Encode(nodes); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleNodeOperations(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	nodeID := parts[2]

	switch {
	case r.Method == "POST" && len(parts) == 4 && parts[3] == "stop":
		handleStopNode(w, r, nodeID)
	case r.Method == "POST" && len(parts) == 4 && parts[3] == "restart":
		handleRestartNode(w, r, nodeID)
	case r.Method == "DELETE":
		handleDeleteNode(w, r, nodeID)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleStopNode(w http.ResponseWriter, r *http.Request, nodeID string) {
	nodesMu.Lock()
	node, exists := nodes[nodeID]
	nodesMu.Unlock()

	if !exists {
		http.Error(w, "Node not found", http.StatusNotFound)
		return
	}

	if len(node.Pods) > 0 {
		http.Error(w, "Cannot stop node with running pods", http.StatusBadRequest)
		return
	}

	// Stop the Docker container
	cmd := exec.Command("docker", "stop", nodeID)
	if err := cmd.Run(); err != nil {
		log.Printf("Error stopping node %s: %v\n", nodeID, err)
		http.Error(w, "Failed to stop node", http.StatusInternalServerError)
		return
	}

	nodesMu.Lock()
	nodes[nodeID].HealthStatus = "Failed"
	nodesMu.Unlock()

	log.Printf("Node %s stopped\n", nodeID)
	w.WriteHeader(http.StatusOK)
}

func handleDeleteNode(w http.ResponseWriter, r *http.Request, nodeID string) {
	nodesMu.Lock()
	node, exists := nodes[nodeID]
	if !exists {
		nodesMu.Unlock()
		http.Error(w, "Node not found", http.StatusNotFound)
		return
	}

	if len(node.Pods) > 0 {
		nodesMu.Unlock()
		http.Error(w, "Cannot delete node with running pods", http.StatusBadRequest)
		return
	}

	if node.HealthStatus != "Failed" {
		nodesMu.Unlock()
		http.Error(w, "Can only delete failed nodes", http.StatusBadRequest)
		return
	}

	// First try to stop the container if it's not already stopped
	stopCmd := exec.Command("docker", "stop", nodeID)
	if err := stopCmd.Run(); err != nil {
		log.Printf("Warning: Error stopping container %s: %v\n", nodeID, err)
		// Continue anyway as the container might already be stopped
	}

	// Then remove the container
	rmCmd := exec.Command("docker", "rm", "-f", nodeID)
	if err := rmCmd.Run(); err != nil {
		log.Printf("Warning: Error removing container %s: %v\n", nodeID, err)
		// Continue with node deletion even if container removal fails
		// The container might not exist anymore
	}

	// Delete the node from our map
	delete(nodes, nodeID)
	nodesMu.Unlock()

	log.Printf("Node %s deleted successfully\n", nodeID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Node deleted successfully",
		"nodeId":  nodeID,
	})
}

func handlePods(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		CPURequired int `json:"cpuRequired"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	if req.CPURequired <= 0 {
		http.Error(w, "CPU required must be positive", http.StatusBadRequest)
		return
	}

	podID := uuid.New().String()
	nodeID, err := schedulePod(req.CPURequired)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	podsMu.Lock()
	pods[podID] = &Pod{
		ID:          podID,
		CPURequired: req.CPURequired,
		NodeID:      nodeID,
		Status:      "Running",
		CreatedAt:   time.Now(),
	}
	podsMu.Unlock()

	nodesMu.Lock()
	nodes[nodeID].Pods = append(nodes[nodeID].Pods, podID)
	nodes[nodeID].AvailableCPU -= req.CPURequired
	nodesMu.Unlock()

	log.Printf("Pod %s launched on node %s with %d CPU\n", podID, nodeID, req.CPURequired)
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "Pod %s launched on node %s with %d CPU\n", podID, nodeID, req.CPURequired)
}

func handleHeartbeat(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var hb struct {
		NodeID string   `json:"nodeID"`
		Status string   `json:"status"`
		Pods   []string `json:"pods"`
	}
	if err := json.NewDecoder(r.Body).Decode(&hb); err != nil {
		http.Error(w, "Invalid heartbeat", http.StatusBadRequest)
		return
	}

	nodesMu.Lock()
	defer nodesMu.Unlock()
	node, exists := nodes[hb.NodeID]
	if !exists {
		http.Error(w, "Node not found", http.StatusNotFound)
		return
	}

	node.LastHeartbeat = time.Now()
	node.HeartbeatCount++
	node.HealthStatus = hb.Status
	log.Printf("Heartbeat received from node %s (count: %d, status: %s)\n",
		hb.NodeID[:8], node.HeartbeatCount, hb.Status)

	if err := json.NewEncoder(w).Encode(map[string][]string{"pods": node.Pods}); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func schedulePod(cpuRequired int) (string, error) {
	nodesMu.Lock()
	defer nodesMu.Unlock()

	var selectedNode string
	minAvailableCPU := int(^uint(0) >> 1) // Max int

	// Implementing Best-Fit scheduling
	for _, node := range nodes {
		if node.HealthStatus == "Healthy" &&
			node.AvailableCPU >= cpuRequired &&
			node.AvailableCPU < minAvailableCPU {
			selectedNode = node.ID
			minAvailableCPU = node.AvailableCPU
		}
	}

	if selectedNode == "" {
		return "", fmt.Errorf("no available node with sufficient CPU")
	}

	log.Printf("Selected node %s for pod (CPU required: %d)\n", selectedNode[:8], cpuRequired)
	return selectedNode, nil
}

func healthMonitor() {
	for {
		time.Sleep(5 * time.Second)
		nodesMu.Lock()
		for nodeID, node := range nodes {
			timeSinceLastHeartbeat := time.Since(node.LastHeartbeat)
			if timeSinceLastHeartbeat > 15*time.Second && node.HealthStatus != "Failed" {
				log.Printf("Node %s marked as Failed (Last heartbeat: %.1f seconds ago)\n",
					nodeID[:8], timeSinceLastHeartbeat.Seconds())
				node.HealthStatus = "Failed"
				podsToReschedule := node.Pods
				node.Pods = []string{}

				// Release the lock before rescheduling
				nodesMu.Unlock()

				// Reschedule pods from failed node
				for _, podID := range podsToReschedule {
					podsMu.Lock()
					pod := pods[podID]
					pod.Status = "Rescheduling"
					podsMu.Unlock()

					newNodeID, err := schedulePod(pod.CPURequired)
					if err != nil {
						log.Printf("Failed to reschedule pod %s: %v\n", podID[:8], err)
						continue
					}

					nodesMu.Lock()
					podsMu.Lock()
					pod.NodeID = newNodeID
					pod.Status = "Running"
					nodes[newNodeID].Pods = append(nodes[newNodeID].Pods, podID)
					nodes[newNodeID].AvailableCPU -= pod.CPURequired
					podsMu.Unlock()
					nodesMu.Unlock()

					log.Printf("Pod %s rescheduled to node %s\n", podID[:8], newNodeID[:8])
				}

				// Reacquire the lock to continue iteration
				nodesMu.Lock()
			}
		}
		nodesMu.Unlock()
	}
}

func handlePodOperations(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	podID := parts[2]

	if r.Method == "DELETE" {
		handleDeletePod(w, r, podID)
		return
	}
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func handleDeletePod(w http.ResponseWriter, r *http.Request, podID string) {
	podsMu.Lock()
	pod, exists := pods[podID]
	if !exists {
		podsMu.Unlock()
		http.Error(w, "Pod not found", http.StatusNotFound)
		return
	}

	nodesMu.Lock()
	node, nodeExists := nodes[pod.NodeID]
	if nodeExists {
		// Remove pod from node
		node.Pods = removeFromSlice(node.Pods, podID)
		node.AvailableCPU += pod.CPURequired
	}
	nodesMu.Unlock()

	// Delete the pod
	delete(pods, podID)
	podsMu.Unlock()

	log.Printf("Pod %s deleted\n", podID)
	w.WriteHeader(http.StatusOK)
}

func handleRestartNode(w http.ResponseWriter, r *http.Request, nodeID string) {
	nodesMu.Lock()
	node, exists := nodes[nodeID]
	nodesMu.Unlock()

	if !exists {
		http.Error(w, "Node not found", http.StatusNotFound)
		return
	}

	if len(node.Pods) > 0 {
		http.Error(w, "Cannot restart node with running pods", http.StatusBadRequest)
		return
	}

	// Stop the container
	stopCmd := exec.Command("docker", "stop", nodeID)
	if err := stopCmd.Run(); err != nil {
		log.Printf("Error stopping node %s: %v\n", nodeID, err)
		http.Error(w, "Failed to stop node", http.StatusInternalServerError)
		return
	}

	// Start the container
	startCmd := exec.Command("docker", "start", nodeID)
	if err := startCmd.Run(); err != nil {
		log.Printf("Error starting node %s: %v\n", nodeID, err)
		http.Error(w, "Failed to start node", http.StatusInternalServerError)
		return
	}

	nodesMu.Lock()
	nodes[nodeID].HealthStatus = "Starting"
	nodesMu.Unlock()

	log.Printf("Node %s restarted\n", nodeID)
	w.WriteHeader(http.StatusOK)
}

func removeFromSlice(slice []string, item string) []string {
	for i, v := range slice {
		if v == item {
			return append(slice[:i], slice[i+1:]...)
		}
	}
	return slice
}
