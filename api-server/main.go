package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"sync"
	"time"

	"github.com/google/uuid"
)

type Node struct {
	ID            string
	CPUCores      int
	AvailableCPU  int
	Pods          []string
	HealthStatus  string
	LastHeartbeat time.Time
}

type Pod struct {
	ID          string
	CPURequired int
	NodeID      string
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
	http.HandleFunc("/nodes", enableCORS(handleNodes))
	http.HandleFunc("/pods", enableCORS(handlePods))
	http.HandleFunc("/heartbeat", enableCORS(handleHeartbeat))

	go healthMonitor()

	fmt.Println("API Server listening on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Server failed:", err)
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
			ID:            nodeID,
			CPUCores:      req.CPUCores,
			AvailableCPU:  req.CPUCores,
			Pods:          []string{},
			HealthStatus:  "Healthy",
			LastHeartbeat: time.Now(),
		}
		nodesMu.Unlock()

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

	// Update pod and node state
	podsMu.Lock()
	pods[podID] = &Pod{
		ID:          podID,
		CPURequired: req.CPURequired,
		NodeID:      nodeID,
	}
	podsMu.Unlock()

	nodesMu.Lock()
	nodes[nodeID].Pods = append(nodes[nodeID].Pods, podID)
	nodes[nodeID].AvailableCPU -= req.CPURequired
	nodesMu.Unlock()

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
	node.HealthStatus = hb.Status
	if err := json.NewEncoder(w).Encode(map[string][]string{"pods": node.Pods}); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func schedulePod(cpuRequired int) (string, error) {
	nodesMu.Lock()
	defer nodesMu.Unlock()

	for _, node := range nodes {
		if node.HealthStatus == "Healthy" && node.AvailableCPU >= cpuRequired {
			return node.ID, nil
		}
	}
	return "", fmt.Errorf("no available node with sufficient CPU")
}

func healthMonitor() {
	for {
		time.Sleep(10 * time.Second)
		nodesMu.Lock()
		for _, node := range nodes {
			if time.Since(node.LastHeartbeat) > 15*time.Second && node.HealthStatus != "Failed" {
				fmt.Printf("Node %s marked as Failed\n", node.ID)
				node.HealthStatus = "Failed"
				podsToReschedule := node.Pods
				node.Pods = []string{}
				nodesMu.Unlock()
				for _, podID := range podsToReschedule {
					pod := pods[podID]
					newNodeID, err := schedulePod(pod.CPURequired)
					if err != nil {
						fmt.Printf("Failed to reschedule pod %s: %v\n", podID, err)
						continue
					}

					nodesMu.Lock()
					podsMu.Lock()
					pod.NodeID = newNodeID
					nodes[newNodeID].Pods = append(nodes[newNodeID].Pods, podID)
					nodes[newNodeID].AvailableCPU -= pod.CPURequired
					podsMu.Unlock()
					nodesMu.Unlock()
					fmt.Printf("Pod %s rescheduled to node %s\n", podID, newNodeID)
				}
				nodesMu.Lock()
			}
		}
		nodesMu.Unlock()
	}
}
