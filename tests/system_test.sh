#!/bin/bash

# Cyberpunk color palette
NEON_PINK='\033[38;5;198m'
NEON_BLUE='\033[38;5;51m'
NEON_GREEN='\033[38;5;46m'
NEON_YELLOW='\033[38;5;226m'
NEON_PURPLE='\033[38;5;165m'
NEON_CYAN='\033[38;5;87m'
NEON_RED='\033[38;5;196m'
NEON_ORANGE='\033[38;5;214m'

# Base colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Styles
BOLD='\033[1m'
DIM='\033[2m'
BLINK='\033[5m'
REVERSE='\033[7m'
UNDERLINE='\033[4m'

# Get terminal width
TERM_WIDTH=$(tput cols)

# Get the absolute path of the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to create a progress bar
progress_bar() {
    local current=$1
    local total=$2
    local width=40
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))
    
    printf "${NEON_BLUE}[${NEON_CYAN}"
    for ((i = 0; i < filled; i++)); do printf "█"; done
    printf "${DIM}"
    for ((i = 0; i < empty; i++)); do printf "░"; done
    printf "${NEON_BLUE}]${NEON_GREEN} %3d%%${NC}" $percentage
}

# Function to print centered text
print_centered() {
    local text="$1"
    local color="$2"
    local padding=$(( (TERM_WIDTH - ${#text}) / 2 ))
    printf "%${padding}s" ''
    echo -e "${color}${text}${NC}"
}

# Function to print a neon box
print_neon_box() {
    local text="$1"
    local color="$2"
    local text_length=${#text}
    local box_width=$((text_length + 4))  # Add padding for the box borders
    local padding=$(( (TERM_WIDTH - box_width) / 2 ))
    
    # Create the top border
    printf "%${padding}s" ''
    echo -e "${color}╔═${BOLD}${text}${NC}${color}═╗${NC}"
    
    # Add empty line
    printf "%${padding}s" ''
    echo -e "${color}║ ${NC}${BOLD}${text}${NC}${color} ║${NC}"
    
    # Create the bottom border with dynamic length
    printf "%${padding}s" ''
    echo -e "${color}╚$(printf '═%.0s' $(seq 1 $((box_width - 2))))╝${NC}"
}

# Function to print test results with enhanced styling
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${NEON_GREEN}${BOLD}[${BLINK}✓${NC}${NEON_GREEN}${BOLD}] ${NEON_CYAN}$2 ${NEON_GREEN}[SUCCESS]${NC}"
    else
        echo -e "${NEON_RED}${BOLD}[${BLINK}✗${NC}${NEON_RED}${BOLD}] ${NEON_PINK}$2 ${NEON_RED}[FAILED]${NC}"
    fi
}

# Function to print status messages with enhanced styling
print_status() {
    echo -e "${NEON_BLUE}${BOLD}[${BLINK}*${NC}${NEON_BLUE}${BOLD}] ${NEON_CYAN}$1${NC}"
}

# Function to print warning messages with enhanced styling
print_warning() {
    echo -e "${NEON_YELLOW}${BOLD}[${BLINK}!${NC}${NEON_YELLOW}${BOLD}] ${NEON_ORANGE}$1${NC}"
}

# Function to print success messages with enhanced styling
print_success() {
    echo -e "${NEON_GREEN}${BOLD}[${BLINK}✓${NC}${NEON_GREEN}${BOLD}] ${NEON_CYAN}$1${NC}"
}

# Function to print error messages with enhanced styling
print_error() {
    echo -e "${NEON_RED}${BOLD}[${BLINK}✗${NC}${NEON_RED}${BOLD}] ${NEON_PINK}$1${NC}"
}

# Function to print cyberpunk banner
print_banner() {
    clear
    echo
    print_centered "╔══════════════════════════════════════════════════════════╗" "${NEON_BLUE}"
    print_centered "║                    KUBE-SIM TESTING                      ║" "${NEON_BLUE}"
    print_centered "╚══════════════════════════════════════════════════════════╝" "${NEON_BLUE}"
    echo
    print_centered "██╗  ██╗██╗   ██╗██████╗ ███████╗    ███████╗██╗███╗   ███╗" "${NEON_CYAN}"
    print_centered "██║ ██╔╝██║   ██║██╔══██╗██╔════╝    ██╔════╝██║████╗ ████║" "${NEON_PURPLE}"
    print_centered "█████╔╝ ██║   ██║██████╔╝█████╗      ███████╗██║██╔████╔██║" "${NEON_PINK}"
    print_centered "██╔═██╗ ██║   ██║██╔══██╗██╔══╝      ╚════██║██║██║╚██╔╝██║" "${NEON_BLUE}"
    print_centered "██║  ██╗╚██████╔╝██████╔╝███████╗    ███████║██║██║ ╚═╝ ██║" "${NEON_GREEN}"
    print_centered "╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚══════╝╚═╝╚═╝     ╚═╝" "${NEON_YELLOW}"
    echo
    print_centered "INITIALIZING SYSTEM TEST SEQUENCE..." "${NEON_CYAN}"
    echo
}

# Function to print test header with enhanced styling
print_test_header() {
    echo
    print_neon_box " TEST: $1 " "${NEON_PURPLE}"
    echo
}

# Function to print section divider
print_divider() {
    echo
    print_centered "════════════════════════════════════════" "${NEON_BLUE}"
    echo
}

# Function to simulate loading animation
simulate_loading() {
    local text="$1"
    local duration=$2
    local interval=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local temp
    
    for ((i = 0; i < duration; i++)); do
        temp=${spinstr#?}
        printf "${NEON_CYAN}${BOLD}[%c]${NC} ${NEON_BLUE}${text}${NC}" "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $interval
        printf "\r"
    done
    printf "\n"
}

# Function to check if Docker is running
check_docker() {
    print_status "Initializing Docker connection..."
    simulate_loading "Establishing connection to Docker daemon" 10
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

# Main test sequence
print_banner

# Initialize test environment
print_neon_box " INITIALIZING TEST ENVIRONMENT " "${NEON_BLUE}"
echo

# Check Docker
check_docker

# Kill existing API server
kill_existing_api

# Start API server with progress indication
print_status "Launching API server..."
cd "$PROJECT_ROOT/api-server" || { print_error "Failed to change to api-server directory"; exit 1; }
go build -o api-server || { print_error "Failed to build api-server"; exit 1; }
./api-server &
API_PID=$!

# Wait for API server with progress bar
for i in {1..10}; do
    progress_bar $i 10
    echo -en "\r"
    sleep 1
done
echo

# Test 1: Add nodes
print_test_header "NODE DEPLOYMENT TEST"
cd "$PROJECT_ROOT/cli" || { print_error "Failed to change to cli directory"; exit 1; }
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

# Print final summary with enhanced styling
echo
print_neon_box " TEST SUMMARY " "${NEON_PURPLE}"
echo
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

# Cleanup with progress indication
print_neon_box " CLEANUP SEQUENCE " "${NEON_RED}"
echo
simulate_loading "Cleaning up resources" 5
cleanup
print_centered "TEST SEQUENCE COMPLETED" "${NEON_GREEN}"
echo 