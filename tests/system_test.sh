#!/bin/bash

# Enhanced Colors and styles for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
ORANGE='\033[0;33m'
PURPLE='\033[0;95m'
NC='\033[0m' # No Color
BOLD='\033[1m'
DIM='\033[2m'
BLINK='\033[5m'
REVERSE='\033[7m'
UNDERLINE='\033[4m'

# Get the absolute path of the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to print test results with enhanced styling
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}${BOLD}${REVERSE}[✓] $2${NC}"
    else
        echo -e "${RED}${BOLD}${REVERSE}[✗] $2${NC}"
    fi
}

# Function to print status messages with enhanced styling
print_status() {
    echo -e "${CYAN}${BOLD}[*] $1${NC}"
}

# Function to print warning messages with enhanced styling
print_warning() {
    echo -e "${YELLOW}${BOLD}[!] $1${NC}"
}

# Function to print debug messages with enhanced styling
print_debug() {
    echo -e "${DIM}[~] $1${NC}"
}

# Function to print success messages with enhanced styling
print_success() {
    echo -e "${GREEN}${BOLD}[✓] $1${NC}"
}

# Function to print error messages with enhanced styling
print_error() {
    echo -e "${RED}${BOLD}[✗] $1${NC}"
}

# Function to print banner with enhanced styling
print_banner() {
    echo -e "${GREEN}${BOLD}${REVERSE}"
    echo "  _  __      _              ____  _           "
    echo " | |/ /_   _| |__   ___    / ___|(_)_ __ ___  "
    echo " | ' /| | | | '_ \ / _ \   \___ \| | '_ \` _ \\ "
    echo " | . \| |_| | |_) |  __/    ___) | | | | | | |"
    echo " |_|\_ \\__,_|_.__/ \___|   |____/|_|_| |_| |_|"
    echo "                                              "
    echo -e "${NC}"
}

# Function to print test header with enhanced styling
print_test_header() {
    echo -e "\n${BLUE}${BOLD}${REVERSE}[=== $1 ===]${NC}"
}

# Function to print section divider
print_divider() {
    echo -e "${MAGENTA}${BOLD}----------------------------------------${NC}"
}

# Function to check if Docker is running
check_docker() {
    print_status "Initializing Docker connection..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker daemon connection established"
}

# Function to kill any existing API server
kill_existing_api() {
    print_status "Checking for existing API server instances..."
    if lsof -i :8080 > /dev/null; then
        print_warning "Found existing process on port 8080"
        lsof -ti :8080 | xargs kill -9
        print_success "Terminated existing API server"
        sleep 2
    fi
}

# Function to wait for API server with improved timeout
wait_for_api() {
    local max_attempts=60
    local attempt=1
    local wait_time=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8080/health > /dev/null; then
            print_success "API server is ready"
            return 0
        fi
        print_status "Waiting for API server (attempt $attempt/$max_attempts)..."
        sleep $wait_time
        wait_time=$(( wait_time < 8 ? wait_time * 2 : 8 ))
        attempt=$(( attempt + 1 ))
    done
    print_error "API server failed to start"
    return 1
}

# Function to wait for node deletion with exponential backoff
wait_for_node_deletion() {
    local node_id=$1
    local max_attempts=45  # Increased from 30
    local attempt=1
    local wait_time=1

    while [ $attempt -le $max_attempts ]; do
        if ! curl -s "http://localhost:8080/nodes/$node_id" > /dev/null 2>&1; then
            return 0
        fi
        print_status "Waiting for node deletion (attempt $attempt/$max_attempts)..."
        sleep $wait_time
        wait_time=$(( wait_time * 2 ))  # Exponential backoff
        attempt=$(( attempt + 1 ))
    done
    return 1
}

# Function to wait for pod deletion with exponential backoff
wait_for_pod_deletion() {
    local pod_id=$1
    local max_attempts=45  # Increased from 30
    local attempt=1
    local wait_time=1

    while [ $attempt -le $max_attempts ]; do
        if ! curl -s "http://localhost:8080/pods/$pod_id" > /dev/null 2>&1; then
            return 0
        fi
        print_status "Waiting for pod deletion (attempt $attempt/$max_attempts)..."
        sleep $wait_time
        wait_time=$(( wait_time * 2 ))  # Exponential backoff
        attempt=$(( attempt + 1 ))
    done
    return 1
}

# Function to make API calls with timeout
make_api_call() {
    local url=$1
    local method=${2:-GET}
    local timeout=10

    if ! curl -s -X "$method" --connect-timeout "$timeout" --max-time "$timeout" "$url" 2>/dev/null; then
        return 1
    fi
    return 0
}

# Function to clean up resources
cleanup() {
    print_status "Initiating cleanup sequence..."
    # Stop all node containers
    docker ps -a --filter "name=node-" -q | xargs -r docker stop
    docker ps -a --filter "name=node-" -q | xargs -r docker rm
    # Kill API server if running
    pkill -f "./api-server" || true
    print_success "Cleanup completed"
}

# Set up trap for cleanup
trap cleanup EXIT

# Print banner
print_banner

# Check if Docker is running
check_docker

# Kill any existing API server
kill_existing_api

# Start API server
print_status "Launching API server..."
cd "$PROJECT_ROOT/api-server"
go build -o api-server
./api-server &
API_PID=$!

# Wait for API server to be ready
if ! wait_for_api; then
    exit 1
fi

# Test 1: Add nodes
print_test_header "NODE DEPLOYMENT TEST"
cd "$PROJECT_ROOT/cli"
./cli add-node 4
NODE1_RESULT=$?
./cli add-node 6
NODE2_RESULT=$?
print_result $NODE1_RESULT "Node deployment (4 cores)"
print_result $NODE2_RESULT "Node deployment (6 cores)"
print_divider

# Test 2: List nodes
print_test_header "NODE STATUS CHECK"
./cli list-nodes
LIST_NODES_RESULT=$?
print_result $LIST_NODES_RESULT "Node status retrieval"
print_divider

# Test 3: Launch pods with different scheduling algorithms
print_test_header "POD SCHEDULING ALGORITHM TEST"

# First-Fit
print_status "Testing First-Fit scheduling algorithm..."
./cli set-scheduler first-fit
./cli launch-pod 2
FIRST_FIT_RESULT=$?
print_result $FIRST_FIT_RESULT "First-Fit pod deployment"

# Best-Fit
print_status "Testing Best-Fit scheduling algorithm..."
./cli set-scheduler best-fit
./cli launch-pod 3
BEST_FIT_RESULT=$?
print_result $BEST_FIT_RESULT "Best-Fit pod deployment"

# Worst-Fit
print_status "Testing Worst-Fit scheduling algorithm..."
./cli set-scheduler worst-fit
./cli launch-pod 2
WORST_FIT_RESULT=$?
print_result $WORST_FIT_RESULT "Worst-Fit pod deployment"
print_divider

# Test 4: List pods
print_test_header "POD STATUS CHECK"
./cli list-pods
LIST_PODS_RESULT=$?
print_result $LIST_PODS_RESULT "Pod status retrieval"
print_divider

# Test 5: Node failure simulation
print_test_header "NODE FAILURE SIMULATION"
NODE_ID=$(docker ps --filter "name=node-" --filter "status=running" --format "{{.ID}}" | head -n 1)
if [ ! -z "$NODE_ID" ]; then
    print_status "Initiating node failure simulation..."
    docker stop $NODE_ID
    print_warning "Node failure injected"
    print_status "Monitoring failure detection..."
    sleep 20
    ./cli list-nodes
    NODE_FAILURE_RESULT=$?
    print_result $NODE_FAILURE_RESULT "Failure detection and status update"
else
    print_error "No running node found for failure simulation"
    NODE_FAILURE_RESULT=1
fi
print_divider

# Test 6: Node Operations
print_test_header "NODE OPERATIONS TEST"
# Get a healthy node ID
HEALTHY_NODE=$(curl -s --connect-timeout 10 --max-time 10 http://localhost:8080/nodes | grep -o '"ID":"[^"]*"' | head -n 1 | cut -d'"' -f4)
if [ ! -z "$HEALTHY_NODE" ]; then
    # First, delete all pods on the node
    print_status "Removing pods from node before operations..."
    POD_IDS=$(curl -s --connect-timeout 10 --max-time 10 http://localhost:8080/pods | grep -o '"ID":"[^"]*"' | cut -d'"' -f4)
    for POD_ID in $POD_IDS; do
        ./cli delete-pod $POD_ID
        sleep 2
    done
    
    # Test node stop
    print_status "Testing node stop operation..."
    ./cli stop-node $HEALTHY_NODE
    NODE_STOP_RESULT=$?
    if [ $NODE_STOP_RESULT -eq 0 ]; then
        print_result 0 "Node stop operation"
        
        # Wait for node to be stopped
        print_status "Waiting for node to stop..."
        sleep 10
        
        # Test node restart
        print_status "Testing node restart operation..."
        ./cli restart-node $HEALTHY_NODE
        NODE_RESTART_RESULT=$?
        print_result $NODE_RESTART_RESULT "Node restart operation"
        
        # Wait for node to be healthy again
        print_status "Waiting for node to recover..."
        sleep 15
    else
        print_result 1 "Node stop operation"
        NODE_RESTART_RESULT=1
    fi
else
    print_error "No healthy node found for operations test"
    NODE_STOP_RESULT=1
    NODE_RESTART_RESULT=1
fi
print_divider

# Summary
echo -e "\n${BLUE}${BOLD}${REVERSE}[=== TEST SUMMARY ===]${NC}"
print_result $NODE1_RESULT "Node deployment (4 cores)"
print_result $NODE2_RESULT "Node deployment (6 cores)"
print_result $LIST_NODES_RESULT "Node status retrieval"
print_result $FIRST_FIT_RESULT "First-Fit scheduling"
print_result $BEST_FIT_RESULT "Best-Fit scheduling"
print_result $WORST_FIT_RESULT "Worst-Fit scheduling"
print_result $LIST_PODS_RESULT "Pod status retrieval"
print_result $NODE_FAILURE_RESULT "Node failure simulation"
print_result $NODE_STOP_RESULT "Node stop operation"
print_result $NODE_RESTART_RESULT "Node restart operation"

# Cleanup will be handled by the trap 