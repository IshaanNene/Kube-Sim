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
			fmt.Println("Usage: cli add-node <cpuCores>")
			os.Exit(1)
		}
		cpuCores, err := strconv.Atoi(os.Args[2])
		if err != nil || cpuCores <= 0 {
			fmt.Println("cpuCores must be a positive integer")
			os.Exit(1)
		}
		req := map[string]int{"cpuCores": cpuCores}
		jsonData, _ := json.Marshal(req)
		resp, err := client.Post("http://localhost:8080/nodes", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Println("Error:", err)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusCreated {
			fmt.Println("Failed to add node, status:", resp.Status)
			os.Exit(1)
		}
		fmt.Println("Node added successfully")

	case "stop-node":
		if len(os.Args) != 3 {
			fmt.Println("Usage: cli stop-node <nodeID>")
			os.Exit(1)
		}
		nodeID := os.Args[2]
		resp, err := client.Post(fmt.Sprintf("http://localhost:8080/nodes/%s/stop", nodeID), "application/json", nil)
		if err != nil {
			fmt.Println("Error:", err)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			fmt.Printf("Failed to stop node: %s\n", string(body))
			os.Exit(1)
		}
		fmt.Println("Node stopped successfully")

	case "delete-node":
		if len(os.Args) != 3 {
			fmt.Println("Usage: cli delete-node <nodeID>")
			os.Exit(1)
		}
		nodeID := os.Args[2]
		req, err := http.NewRequest("DELETE", fmt.Sprintf("http://localhost:8080/nodes/%s", nodeID), nil)
		if err != nil {
			fmt.Println("Error:", err)
			os.Exit(1)
		}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Println("Error:", err)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			fmt.Printf("Failed to delete node: %s\n", string(body))
			os.Exit(1)
		}
		fmt.Println("Node deleted successfully")

	case "launch-pod":
		if len(os.Args) != 3 {
			fmt.Println("Usage: cli launch-pod <cpuRequired>")
			os.Exit(1)
		}
		cpuRequired, err := strconv.Atoi(os.Args[2])
		if err != nil || cpuRequired <= 0 {
			fmt.Println("cpuRequired must be a positive integer")
			os.Exit(1)
		}
		req := map[string]int{"cpuRequired": cpuRequired}
		jsonData, _ := json.Marshal(req)
		resp, err := client.Post("http://localhost:8080/pods", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Println("Error:", err)
			os.Exit(1)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusCreated {
			fmt.Println("Failed to launch pod, status:", resp.Status)
			os.Exit(1)
		}
		fmt.Println("Pod launched successfully")

	case "list-nodes":
		resp, err := client.Get("http://localhost:8080/nodes")
		if err != nil {
			fmt.Println("Error:", err)
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
			fmt.Println("Failed to decode response:", err)
			os.Exit(1)
		}
		for _, node := range nodes {
			fmt.Printf("Node %s: CPU %d/%d, Status: %s, Pods: %v\n",
				node.ID, node.AvailableCPU, node.CPUCores, node.HealthStatus, node.Pods)
		}

	default:
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Usage: cli <command> [args]")
	fmt.Println("Commands:")
	fmt.Println("  add-node <cpuCores>     Add a new node with specified CPU cores")
	fmt.Println("  stop-node <nodeID>      Stop a node")
	fmt.Println("  delete-node <nodeID>    Delete a stopped node")
	fmt.Println("  launch-pod <cpuRequired> Launch a pod with specified CPU requirements")
	fmt.Println("  list-nodes              List all nodes with their health status")
}
