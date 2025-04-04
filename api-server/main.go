package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
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
	http.HandleFunc("/pods", enableCORS(handlePods))
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
