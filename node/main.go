package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
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

func main() {
	nodeID := os.Getenv("NODE_ID")
	apiServer := os.Getenv("API_SERVER")
	if nodeID == "" || apiServer == "" {
		fmt.Printf("%s%s[✗] %sNODE_ID and API_SERVER environment variables must be set%s\n", NEON_RED, BOLD, NEON_PINK, NC)
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
			fmt.Printf("%s%s[!] %sFailed to send heartbeat: %v%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, err, NC)
			continue
		}
		defer resp.Body.Close()

		var res struct {
			Pods []string `json:"pods"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
			fmt.Printf("%s%s[!] %sFailed to decode heartbeat response: %v%s\n", NEON_YELLOW, BOLD, NEON_ORANGE, err, NC)
			continue
		}
		pods = res.Pods
		fmt.Printf("%s%s[*] %sNode %s pods updated: %v%s\n", NEON_BLUE, BOLD, NEON_CYAN, nodeID, pods, NC)
	}
}
