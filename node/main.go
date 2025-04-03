package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

func main() {
	nodeID := os.Getenv("NODE_ID")
	apiServer := os.Getenv("API_SERVER")
	if nodeID == "" || apiServer == "" {
		fmt.Println("NODE_ID and API_SERVER environment variables must be set")
		os.Exit(1)
	}

	pods := []string{}
	client := &http.Client{Timeout: 10 * time.Second}

	for {
		time.Sleep(5 * time.Second)
		hb := map[string]interface{}{
			"nodeID": nodeID,
			"status": "Healthy",
			"pods":   pods,
		}
		jsonData, _ := json.Marshal(hb)
		resp, err := client.Post(apiServer+"/heartbeat", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Println("Failed to send heartbeat:", err)
			continue
		}
		defer resp.Body.Close()

		var res struct {
			Pods []string `json:"pods"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
			fmt.Println("Failed to decode heartbeat response:", err)
			continue
		}
		pods = res.Pods
		fmt.Printf("Node %s pods updated: %v\n", nodeID, pods)
	}
}