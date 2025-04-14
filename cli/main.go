package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"
)

// Cyberpunk color codes
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

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]
	client := &http.Client{Timeout: 10 * time.Second}

	switch command {
	case "add-node":
		if len(os.Args) != 3 {
			fmt.Printf("%s%s[!] %sUsage: cli add-node <cpuCores>%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		cpuCores, err := strconv.Atoi(os.Args[2])
		if err != nil || cpuCores <= 0 {
			fmt.Printf("%s%s[!] %scpuCores must be a positive integer%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		req := map[string]int{"cpuCores": cpuCores}
		jsonData, _ := json.Marshal(req)
		resp, err := client.Post("http://localhost:8080/nodes", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusCreated {
			fmt.Printf("%s%s[✗] %sFailed to add node, status: %s%s\n", NEON_RED, BOLD, NEON_PINK, resp.Status, NC)
			os.Exit(1)
		}
		fmt.Printf("%s%s[✓] %sNode added successfully%s\n", NEON_GREEN, BOLD, NEON_CYAN, NC)

	case "stop-node":
		if len(os.Args) != 3 {
			fmt.Printf("%s%s[!] %sUsage: cli stop-node <nodeID>%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		nodeID := os.Args[2]
		resp, err := client.Post(fmt.Sprintf("http://localhost:8080/nodes/%s/stop", nodeID), "application/json", nil)
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			fmt.Printf("%s%s[✗] %sFailed to stop node: %s%s\n", NEON_RED, BOLD, NEON_PINK, string(body), NC)
			os.Exit(1)
		}
		fmt.Printf("%s%s[✓] %sNode stopped successfully%s\n", NEON_GREEN, BOLD, NEON_CYAN, NC)

	case "restart-node":
		if len(os.Args) != 3 {
			fmt.Printf("%s%s[!] %sUsage: cli restart-node <nodeID>%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		nodeID := os.Args[2]
		resp, err := client.Post(fmt.Sprintf("http://localhost:8080/nodes/%s/restart", nodeID), "application/json", nil)
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			fmt.Printf("%s%s[✗] %sFailed to restart node: %s%s\n", NEON_RED, BOLD, NEON_PINK, string(body), NC)
			os.Exit(1)
		}
		fmt.Printf("%s%s[✓] %sNode restarted successfully%s\n", NEON_GREEN, BOLD, NEON_CYAN, NC)

	case "delete-pod":
		if len(os.Args) != 3 {
			fmt.Printf("%s%s[!] %sUsage: cli delete-pod <podID>%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		podID := os.Args[2]
		req, err := http.NewRequest("DELETE", fmt.Sprintf("http://localhost:8080/pods/%s", podID), nil)
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			fmt.Printf("%s%s[✗] %sFailed to delete pod: %s%s\n", NEON_RED, BOLD, NEON_PINK, string(body), NC)
			os.Exit(1)
		}
		fmt.Printf("%s%s[✓] %sPod deleted successfully%s\n", NEON_GREEN, BOLD, NEON_CYAN, NC)

	case "delete-node":
		if len(os.Args) != 3 {
			fmt.Printf("%s%s[!] %sUsage: cli delete-node <nodeID>%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		nodeID := os.Args[2]
		req, err := http.NewRequest("DELETE", fmt.Sprintf("http://localhost:8080/nodes/%s", nodeID), nil)
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			fmt.Printf("%s%s[✗] %sFailed to delete node: %s%s\n", NEON_RED, BOLD, NEON_PINK, string(body), NC)
			os.Exit(1)
		}
		fmt.Printf("%s%s[✓] %sNode deleted successfully%s\n", NEON_GREEN, BOLD, NEON_CYAN, NC)

	case "launch-pod":
		if len(os.Args) != 3 {
			fmt.Printf("%s%s[!] %sUsage: cli launch-pod <cpuRequired>%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		cpuRequired, err := strconv.Atoi(os.Args[2])
		if err != nil || cpuRequired <= 0 {
			fmt.Printf("%s%s[!] %scpuRequired must be a positive integer%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		req := map[string]int{"cpuRequired": cpuRequired}
		jsonData, _ := json.Marshal(req)
		resp, err := client.Post("http://localhost:8080/pods", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusCreated {
			fmt.Printf("%s%s[✗] %sFailed to launch pod, status: %s%s\n", NEON_RED, BOLD, NEON_PINK, resp.Status, NC)
			os.Exit(1)
		}
		fmt.Printf("%s%s[✓] %sPod launched successfully%s\n", NEON_GREEN, BOLD, NEON_CYAN, NC)

	case "list-nodes":
		resp, err := client.Get("http://localhost:8080/nodes")
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()
		var nodes map[string]struct {
			ID           string   `json:"ID"`
			CPUCores     int      `json:"CPUCores"`
			AvailableCPU int      `json:"AvailableCPU"`
			Pods         []string `json:"Pods"`
			HealthStatus string   `json:"HealthStatus"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&nodes); err != nil {
			fmt.Printf("%s%s[✗] %sFailed to decode response: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		for _, node := range nodes {
			fmt.Printf("%s%s[*] %sNode %s: CPU %d/%d, Status: %s, Pods: %v%s\n",
				NEON_BLUE, BOLD, NEON_CYAN, node.ID, node.AvailableCPU, node.CPUCores, node.HealthStatus, node.Pods, NC)
		}

	case "set-scheduler":
		if len(os.Args) != 3 {
			fmt.Printf("%s%s[!] %sUsage: cli set-scheduler <algorithm>%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			fmt.Printf("%s%s[!] %sAvailable algorithms: first-fit, best-fit, worst-fit%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		algorithm := os.Args[2]
		if algorithm != "first-fit" && algorithm != "best-fit" && algorithm != "worst-fit" {
			fmt.Printf("%s%s[!] %sInvalid algorithm. Must be one of: first-fit, best-fit, worst-fit%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, NC)
			os.Exit(1)
		}
		req := map[string]string{"algorithm": algorithm}
		jsonData, _ := json.Marshal(req)
		resp, err := client.Post("http://localhost:8080/scheduler", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			fmt.Printf("%s%s[✗] %sFailed to set scheduler, status: %s%s\n", NEON_RED, BOLD, NEON_PINK, resp.Status, NC)
			os.Exit(1)
		}
		fmt.Printf("%s%s[✓] %sScheduler algorithm set to %s%s\n", NEON_GREEN, BOLD, NEON_CYAN, algorithm, NC)

	case "list-pods":
		resp, err := client.Get("http://localhost:8080/pods")
		if err != nil {
			fmt.Printf("%s%s[✗] %sError: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Printf("%s%s[✗] %sError reading response: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}

		if resp.StatusCode != http.StatusOK {
			fmt.Printf("%s%s[✗] %sError: %s%s\n", NEON_RED, BOLD, NEON_PINK, string(body), NC)
			os.Exit(1)
		}

		var pods map[string]struct {
			ID          string `json:"ID"`
			CPURequired int    `json:"CPURequired"`
			NodeID      string `json:"NodeID"`
			Status      string `json:"Status"`
			CreatedAt   string `json:"CreatedAt"`
		}

		if err := json.Unmarshal(body, &pods); err != nil {
			fmt.Printf("%s%s[✗] %sError decoding response: %v%s\n", NEON_RED, BOLD, NEON_PINK, err, NC)
			os.Exit(1)
		}

		if len(pods) == 0 {
			fmt.Printf("%s%s[*] %sNo pods found%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
			return
		}

		fmt.Printf("%s%s[*] %sPods:%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
		for _, pod := range pods {
			fmt.Printf("%s%s[*] %sPod %s: CPU %d, Node %s, Status: %s, Created: %s%s\n",
				NEON_BLUE, BOLD, NEON_CYAN, pod.ID[:8], pod.CPURequired, pod.NodeID[:8], pod.Status, pod.CreatedAt, NC)
		}

	default:
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Printf("%s%s[*] %sUsage: cli <command> [args]%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %sCommands:%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  add-node <cpuCores>     Add a new node with specified CPU cores%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  stop-node <nodeID>      Stop a node%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  restart-node <nodeID>   Restart a node%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  delete-pod <podID>      Delete a pod%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  delete-node <nodeID>    Delete a stopped node%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  launch-pod <cpuRequired> Launch a pod with specified CPU requirements%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  list-nodes              List all nodes with their health status%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  list-pods               List all pods with their details%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
	fmt.Printf("%s%s[*] %s  set-scheduler <algorithm> Change the scheduling algorithm (first-fit, best-fit, worst-fit)%s\n", NEON_BLUE, BOLD, NEON_CYAN, NC)
}
