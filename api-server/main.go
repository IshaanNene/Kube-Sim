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

const (
	NEON_PINK   = "\033[38;5;198m"
	NEON_BLUE   = "\033[38;5;51m"
	NEON_GREEN  = "\033[38;5;46m"
	NEON_YELLOW = "\033[38;5;226m"
	NEON_CYAN   = "\033[38;5;87m"
	NEON_RED    = "\033[38;5;196m"
	NEON_ORANGE = "\033[38;5;214m"
	BOLD        = "\033[1m"
	NC          = "\033[0m"
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

type Scheduler struct {
	Algorithm string
	Nodes     map[string]*Node
}

var (
	nodes     = make(map[string]*Node)
	pods      = make(map[string]*Pod)
	nodesMu   sync.Mutex
	podsMu    sync.Mutex
	scheduler = &Scheduler{
		Algorithm: "first-fit",
		Nodes:     make(map[string]*Node),
	}
)

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
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
	fmt.Printf("%s%s[*] %sStarting Kube-Sim API Server...%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)

	mux := http.NewServeMux()
	mux.HandleFunc("/nodes", enableCORS(handleNodes))
	mux.HandleFunc("/nodes/", enableCORS(handleNodeOperations))
	mux.HandleFunc("/pods", enableCORS(handlePods))
	mux.HandleFunc("/pods/", enableCORS(handlePodOperations))
	mux.HandleFunc("/heartbeat", enableCORS(handleHeartbeat))
	mux.HandleFunc("/scheduler", enableCORS(handleScheduler))
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	go healthMonitor()

	fmt.Printf("%s%s[*] %sAPI Server listening on :8080%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	if err := http.ListenAndServe(":8080", mux); err != nil {
		fmt.Printf("%s%s[✗] %sServer failed: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
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
		cmd := exec.Command("docker", "run", "-d", "--name", "node-"+nodeID,
			"-e", "NODE_ID="+nodeID,
			"-e", "API_SERVER=http://host.docker.internal:8080",
			"node-image")
		if err := cmd.Run(); err != nil {
			fmt.Printf("%s%s[✗] %sError launching node container: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			http.Error(w, "Failed to launch node container", http.StatusInternalServerError)
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

		fmt.Printf("%s%s[✓] %sNode %s added with %d CPU cores%s\n", NEON_GREEN, BOLD, NEON_CYAN, nodeID, req.CPUCores, NC)
		w.WriteHeader(http.StatusCreated)
		response := map[string]string{
			"message": fmt.Sprintf("Node %s added with %d CPU cores", nodeID, req.CPUCores),
			"nodeId":  nodeID,
		}
		json.NewEncoder(w).Encode(response)

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

	cmd := exec.Command("docker", "stop", "node-"+nodeID)
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

	cmd := exec.Command("docker", "rm", "-f", "node-"+nodeID)
	if err := cmd.Run(); err != nil {
		log.Printf("Error deleting node %s: %v\n", nodeID, err)
		http.Error(w, "Failed to delete node", http.StatusInternalServerError)
		return
	}

	nodesMu.Lock()
	delete(nodes, nodeID)
	nodesMu.Unlock()

	log.Printf("Node %s deleted\n", nodeID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Node deleted successfully",
		"nodeId":  nodeID,
	})
}

func handlePods(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "GET":
		podsMu.Lock()
		defer podsMu.Unlock()

		podsWithFormattedTime := make(map[string]struct {
			ID          string `json:"ID"`
			CPURequired int    `json:"CPURequired"`
			NodeID      string `json:"NodeID"`
			Status      string `json:"Status"`
			CreatedAt   string `json:"CreatedAt"`
		})

		for id, pod := range pods {
			podsWithFormattedTime[id] = struct {
				ID          string `json:"ID"`
				CPURequired int    `json:"CPURequired"`
				NodeID      string `json:"NodeID"`
				Status      string `json:"Status"`
				CreatedAt   string `json:"CreatedAt"`
			}{
				ID:          pod.ID,
				CPURequired: pod.CPURequired,
				NodeID:      pod.NodeID,
				Status:      pod.Status,
				CreatedAt:   pod.CreatedAt.Format(time.RFC3339),
			}
		}

		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(podsWithFormattedTime); err != nil {
			log.Printf("Error encoding pods response: %v", err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}

	case "POST":
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
		response := map[string]string{
			"message": fmt.Sprintf("Pod %s launched on node %s with %d CPU", podID, nodeID, req.CPURequired),
			"podId":   podID,
			"nodeId":  nodeID,
		}
		json.NewEncoder(w).Encode(response)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
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
	fmt.Printf("%s%s[*] %sHeartbeat received from node %s (count: %d, status: %s)%s\n",
		NEON_BLUE, BOLD, NEON_CYAN, hb.NodeID[:8], node.HeartbeatCount, hb.Status, NC)

	if err := json.NewEncoder(w).Encode(map[string][]string{"pods": node.Pods}); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func handleScheduler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Algorithm string `json:"algorithm"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.Algorithm != "first-fit" && req.Algorithm != "best-fit" && req.Algorithm != "worst-fit" {
		http.Error(w, "Invalid algorithm", http.StatusBadRequest)
		return
	}

	scheduler.Algorithm = req.Algorithm
	log.Printf("Scheduler algorithm changed to %s", scheduler.Algorithm)
	w.WriteHeader(http.StatusOK)
}

func schedulePod(cpuRequired int) (string, error) {
	nodesMu.Lock()
	defer nodesMu.Unlock()

	switch scheduler.Algorithm {
	case "first-fit":
		return firstFitScheduling(cpuRequired)
	case "best-fit":
		return bestFitScheduling(cpuRequired)
	case "worst-fit":
		return worstFitScheduling(cpuRequired)
	default:
		return firstFitScheduling(cpuRequired)
	}
}

func firstFitScheduling(cpuRequired int) (string, error) {
	log.Printf("First-Fit scheduling: Looking for node with %d CPU cores", cpuRequired)
	for _, node := range nodes {
		if node.HealthStatus == "Healthy" && node.AvailableCPU >= cpuRequired {
			log.Printf("First-Fit: Selected node %s with %d available CPU cores", node.ID, node.AvailableCPU)
			return node.ID, nil
		}
	}
	log.Printf("First-Fit: No suitable node found for %d CPU cores", cpuRequired)
	return "", fmt.Errorf("no available node with sufficient CPU")
}

func bestFitScheduling(cpuRequired int) (string, error) {
	log.Printf("Best-Fit scheduling: Looking for node with %d CPU cores", cpuRequired)
	var selectedNode string
	minAvailableCPU := int(^uint(0) >> 1) // Max int

	for _, node := range nodes {
		if node.HealthStatus == "Healthy" &&
			node.AvailableCPU >= cpuRequired &&
			node.AvailableCPU < minAvailableCPU {
			selectedNode = node.ID
			minAvailableCPU = node.AvailableCPU
		}
	}

	if selectedNode == "" {
		log.Printf("Best-Fit: No suitable node found for %d CPU cores", cpuRequired)
		return "", fmt.Errorf("no available node with sufficient CPU")
	}

	log.Printf("Best-Fit: Selected node %s with %d available CPU cores", selectedNode, minAvailableCPU)
	return selectedNode, nil
}

func worstFitScheduling(cpuRequired int) (string, error) {
	log.Printf("Worst-Fit scheduling: Looking for node with %d CPU cores", cpuRequired)
	var selectedNode string
	maxAvailableCPU := 0

	for _, node := range nodes {
		if node.HealthStatus == "Healthy" &&
			node.AvailableCPU >= cpuRequired &&
			node.AvailableCPU > maxAvailableCPU {
			selectedNode = node.ID
			maxAvailableCPU = node.AvailableCPU
		}
	}

	if selectedNode == "" {
		log.Printf("Worst-Fit: No suitable node found for %d CPU cores", cpuRequired)
		return "", fmt.Errorf("no available node with sufficient CPU")
	}

	log.Printf("Worst-Fit: Selected node %s with %d available CPU cores", selectedNode, maxAvailableCPU)
	return selectedNode, nil
}

func healthMonitor() {
	for {
		time.Sleep(5 * time.Second)
		nodesMu.Lock()
		for nodeID, node := range nodes {
			timeSinceLastHeartbeat := time.Since(node.LastHeartbeat)
			if timeSinceLastHeartbeat > 15*time.Second && node.HealthStatus != "Failed" {
				fmt.Printf("%s%s[!] %sNode %s marked as Failed (Last heartbeat: %.1f seconds ago)%s\n",
					NEON_YELLOW, BOLD, NEON_ORANGE, nodeID[:8], timeSinceLastHeartbeat.Seconds(), NC)
				node.HealthStatus = "Failed"
				podsToReschedule := node.Pods
				node.Pods = []string{}
				nodesMu.Unlock()
				for _, podID := range podsToReschedule {
					podsMu.Lock()
					pod := pods[podID]
					pod.Status = "Rescheduling"
					podsMu.Unlock()

					newNodeID, err := schedulePod(pod.CPURequired)
					if err != nil {
						fmt.Printf("%s%s[✗] %sFailed to reschedule pod %s: %v%s\n", NEON_RED, BOLD, NEON_PINK, podID[:8], err, NC)
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

					fmt.Printf("%s%s[✓] %sPod %s rescheduled to node %s%s\n", NEON_GREEN, BOLD, NEON_CYAN, podID[:8], newNodeID[:8], NC)
				}
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

	switch {
	case r.Method == "DELETE":
		handleDeletePod(w, r, podID)
	case r.Method == "POST" && len(parts) == 4 && parts[3] == "restart":
		handleRestartPod(w, r, podID)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
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
		node.Pods = removeFromSlice(node.Pods, podID)
		node.AvailableCPU += pod.CPURequired
		log.Printf("Updated node %s: Available CPU now %d, Pods: %v\n",
			node.ID, node.AvailableCPU, node.Pods)
	}
	nodesMu.Unlock()
	delete(pods, podID)
	podsMu.Unlock()

	log.Printf("Pod %s deleted\n", podID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Pod deleted successfully",
		"podId":   podID,
	})
}

func handleRestartPod(w http.ResponseWriter, r *http.Request, podID string) {
	podsMu.Lock()
	pod, exists := pods[podID]
	if !exists {
		podsMu.Unlock()
		http.Error(w, "Pod not found", http.StatusNotFound)
		return
	}
	podsMu.Unlock()

	nodesMu.Lock()
	_, nodeExists := nodes[pod.NodeID]
	if !nodeExists {
		nodesMu.Unlock()
		http.Error(w, "Node not found", http.StatusNotFound)
		return
	}

	podsMu.Lock()
	pod.Status = "Restarting"
	podsMu.Unlock()

	go func() {
		time.Sleep(2 * time.Second)
		podsMu.Lock()
		pod.Status = "Running"
		podsMu.Unlock()
		log.Printf("Pod %s restarted\n", podID)
	}()

	nodesMu.Unlock()

	log.Printf("Pod %s restart initiated\n", podID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Pod restart initiated",
		"podId":   podID,
	})
}

func handleRestartNode(w http.ResponseWriter, r *http.Request, nodeID string) {
	nodesMu.Lock()
	_, exists := nodes[nodeID]
	nodesMu.Unlock()

	if !exists {
		http.Error(w, "Node not found", http.StatusNotFound)
		return
	}
	
	cmd := exec.Command("docker", "start", "node-"+nodeID)
	if err := cmd.Run(); err != nil {
		log.Printf("Error restarting node %s: %v\n", nodeID, err)
		http.Error(w, "Failed to restart node", http.StatusInternalServerError)
		return
	}

	nodesMu.Lock()
	nodes[nodeID].HealthStatus = "Healthy"
	nodes[nodeID].LastHeartbeat = time.Now()
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
