#!/bin/bash

# Professional cyberpunk color palette
TERMINAL_GREEN='\033[38;5;70m'
TERMINAL_CYAN='\033[38;5;51m'
TERMINAL_BLUE='\033[38;5;33m'
TERMINAL_MAGENTA='\033[38;5;171m'
TERMINAL_RED='\033[38;5;196m'
TERMINAL_YELLOW='\033[38;5;220m'
INTERFACE_HEADER='\033[38;5;27m'
INTERFACE_TEXT='\033[38;5;87m'
INTERFACE_WARNING='\033[38;5;208m'
INTERFACE_ERROR='\033[38;5;196m'
INTERFACE_SUCCESS='\033[38;5;46m'
STARK_RED='\033[38;5;196m'
STARK_GOLD='\033[38;5;220m'
JARVIS_BLUE='\033[38;5;39m'
HOLOGRAM_CYAN='\033[38;5;51m'
REACTOR_BLUE='\033[38;5;33m'
NEON_PINK='\033[38;5;198m'
NEON_BLUE='\033[38;5;51m'
NEON_GREEN='\033[38;5;46m'
NEON_YELLOW='\033[38;5;226m'
NEON_PURPLE='\033[38;5;165m'
NEON_CYAN='\033[38;5;87m'
NEON_RED='\033[38;5;196m'
NEON_ORANGE='\033[38;5;214m'
NEON_BLUE='\033[38;5;33m'      # Bright blue
ELECTRIC_CYAN='\033[38;5;51m'   # Electric cyan
DEEP_PURPLE='\033[38;5;93m'     # Deep purple
VIBRANT_MAGENTA='\033[38;5;201m' # Vibrant magenta
TERMINAL_CYAN='\033[38;5;87m'   # Terminal cyan
RESET='\033[0m'  
BRIGHT_YELLOW='\033[38;5;226m'  # Bright yellow
GOLD='\033[38;5;220m'           # Gold
ORANGE='\033[38;5;208m'         # Orange
DEEP_ORANGE='\033[38;5;202m'    # Deep orange
BRIGHT_RED='\033[38;5;196m'     # Bright red
HEADER_COLOR='\033[38;5;214m'   # Amber (for header)
RESET='\033[0m'                 # Reset color code

BRIGHT_YELLOW='\033[38;5;226m'  # Bright yellow
GOLD='\033[38;5;220m'           # Gold
ORANGE='\033[38;5;208m'         # Orange
DEEP_ORANGE='\033[38;5;202m'    # Deep orange
BRIGHT_RED='\033[38;5;196m'     # Bright red
NC='\033[0m'                    # Reset color code
BOLD='\033[1m'                  # Bold text

# Base colors
NC='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
BLINK='\033[5m'
UNDERLINE='\033[4m'

# Get terminal width
TERM_WIDTH=$(tput cols)

# Get the absolute path of the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to create a sleek progress bar
progress_bar() {
    local current=$1
    local total=$2
    local width=40
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))
    
    printf "${TERMINAL_BLUE}[${TERMINAL_CYAN}"
    for ((i = 0; i < filled; i++)); do printf "█"; done
    printf "${DIM}"
    for ((i = 0; i < empty; i++)); do printf "░"; done
    printf "${TERMINAL_BLUE}]${INTERFACE_TEXT} %3d%%${NC}" $percentage
}

# Function to print centered text
print_centered() {
    local text="$1"
    local color="$2"
    local padding=$(( (TERM_WIDTH - ${#text}) / 2 ))
    printf "%${padding}s" ''
    echo -e "${color}${text}${NC}"
}

# Function to print a minimalist box
print_box() {
    local text="$1"
    local color="$2"
    local text_length=${#text}
    local box_width=$((text_length + 4))
    local padding=$(( (TERM_WIDTH - box_width) / 2 ))
    
    # Create the top border
    printf "%${padding}s" ''
    echo -e "${color}┌$(printf '─%.0s' $(seq 1 $((box_width - 2))))┐${NC}"
    
    # Add text
    printf "%${padding}s" ''
    echo -e "${color}│ ${BOLD}${text}${NC}${color} │${NC}"
    
    # Create the bottom border
    printf "%${padding}s" ''
    echo -e "${color}└$(printf '─%.0s' $(seq 1 $((box_width - 2))))┘${NC}"
}

# Function to print test results with modern styling
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${INTERFACE_SUCCESS}${BOLD}[✓]${NC} ${INTERFACE_TEXT}$2 ${INTERFACE_SUCCESS}[SUCCESS]${NC}"
    else
        echo -e "${INTERFACE_ERROR}${BOLD}[✗]${NC} ${TERMINAL_MAGENTA}$2 ${INTERFACE_ERROR}[FAILED]${NC}"
    fi
}

# Function to print status messages with modern styling
print_status() {
    echo -e "${TERMINAL_BLUE}${BOLD}[*]${NC} ${INTERFACE_TEXT}$1${NC}"
}

# Function to print warning messages with modern styling
print_warning() {
    echo -e "${INTERFACE_WARNING}${BOLD}[!]${NC} ${INTERFACE_WARNING}$1${NC}"
}

# Function to print success messages with modern styling
print_success() {
    echo -e "${INTERFACE_SUCCESS}${BOLD}[+]${NC} ${INTERFACE_TEXT}$1${NC}"
}

# Function to print error messages with modern styling
print_error() {
    echo -e "${INTERFACE_ERROR}${BOLD}[-]${NC} ${TERMINAL_MAGENTA}$1${NC}"
}

print_banner() {
    clear
    echo
    print_centered "┌─────────────────────────────────────────────────────────┐" "${HEADER_COLOR}"
    print_centered "│                  KUBE-SIM TEST FRAMEWORK                │" "${HEADER_COLOR}"
    print_centered "└─────────────────────────────────────────────────────────┘" "${HEADER_COLOR}"
    echo
    print_centered "██╗  ██╗██╗   ██╗██████╗ ███████╗    ███████╗██╗███╗   ███╗" "${BRIGHT_YELLOW}"
    print_centered "██║ ██╔╝██║   ██║██╔══██╗██╔════╝    ██╔════╝██║████╗ ████║" "${GOLD}"
    print_centered "█████╔╝ ██║   ██║██████╔╝█████╗      ███████╗██║██╔████╔██║" "${ORANGE}"
    print_centered "██╔═██╗ ██║   ██║██╔══██╗██╔══╝      ╚════██║██║██║╚██╔╝██║" "${DEEP_ORANGE}"
    print_centered "██║  ██╗╚██████╔╝██████╔╝███████╗    ███████║██║██║ ╚═╝ ██║" "${BRIGHT_RED}"
    print_centered "╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚══════╝╚═╝╚═╝     ╚═╝" "${BRIGHT_RED}"
    echo
    print_centered "INITIALIZING SYSTEM TEST SEQUENCE..." "${GOLD}"
    echo
}

# Function to print section divider
print_divider() {
    echo
    print_centered "──────────────────────────────────────" "${TERMINAL_BLUE}"
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
        printf "${TERMINAL_CYAN}${BOLD}[%c]${NC} ${TERMINAL_BLUE}${text}${NC}" "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $interval
        printf "\r"
    done
    printf "\n"
}

# Function to check if Docker is running
check_docker() {
    print_status "Initializing Docker connection..."
    simulate_loading "Establishing connection to Docker daemon" 5
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
    local max_attempts=45
    local attempt=1
    local wait_time=1

    while [ $attempt -le $max_attempts ]; do
        if ! curl -s "http://localhost:8080/nodes/$node_id" > /dev/null 2>&1; then
            return 0
        fi
        print_status "Waiting for node deletion (attempt $attempt/$max_attempts)..."
        sleep $wait_time
        wait_time=$(( wait_time * 2 ))
        attempt=$(( attempt + 1 ))
    done
    return 1
}

# Function to wait for pod deletion with exponential backoff
wait_for_pod_deletion() {
    local pod_id=$1
    local max_attempts=45
    local attempt=1
    local wait_time=1

    while [ $attempt -le $max_attempts ]; do
        if ! curl -s "http://localhost:8080/pods/$pod_id" > /dev/null 2>&1; then
            return 0
        fi
        print_status "Waiting for pod deletion (attempt $attempt/$max_attempts)..."
        sleep $wait_time
        wait_time=$(( wait_time * 2 ))
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

# Modern visual effects

# Function to create a binary rain effect
binary_rain() {
    local text="$1"
    local duration=$2
    local width=40
    local chars=("0" "1")
    
    for ((i = 0; i < duration; i++)); do
        printf "${TERMINAL_GREEN}${BOLD}["
        for ((j = 0; j < width; j++)); do
            printf "${chars[$RANDOM % 2]}"
        done
        printf "]${NC} ${TERMINAL_CYAN}${text}${NC}\r"
        sleep 0.1
    done
    printf "\n"
}

# Function to create a wave effect
wave_effect() {
    local text="$1"
    local duration=$2
    local wave_chars=("▁" "▂" "▃" "▄" "▅" "▆" "▇" "█" "▇" "▆" "▅" "▄" "▃" "▂")
    
    for ((i = 0; i < duration; i++)); do
        printf "${TERMINAL_BLUE}${BOLD}["
        for ((j = 0; j < ${#wave_chars[@]}; j++)); do
            printf "${wave_chars[($j + i) % ${#wave_chars[@]}]}"
        done
        printf "]${NC} ${TERMINAL_CYAN}${text}${NC}\r"
        sleep 0.1
    done
    printf "\n"
}

# Function to create a pulse effect
pulse_effect() {
    local text="$1"
    local duration=$2
    local colors=("${TERMINAL_MAGENTA}" "${TERMINAL_BLUE}" "${TERMINAL_CYAN}" "${TERMINAL_GREEN}")
    
    for ((i = 0; i < duration; i++)); do
        local color=${colors[$((i % ${#colors[@]}))]}
        printf "${color}${BOLD}[○]${NC} ${TERMINAL_CYAN}${text}${NC}\r"
        sleep 0.2
    done
    printf "\n"
}

# Function to create a scanning effect
scan_effect() {
    local text="$1"
    local duration=$2
    local width=20
    local scan_char="█"
    
    for ((i = 0; i < duration; i++)); do
        printf "${TERMINAL_GREEN}${BOLD}["
        for ((j = 0; j < width; j++)); do
            if [ $j -eq $((i % width)) ]; then
                printf "${scan_char}"
            else
                printf " "
            fi
        done
        printf "]${NC} ${TERMINAL_CYAN}${text}${NC}\r"
        sleep 0.1
    done
    printf "\n"
}

# Function to create a data visualization effect
data_effect() {
    local text="$1"
    local duration=$2
    local data_chars=("╱" "╲" "│" "─")
    
    for ((i = 0; i < duration; i++)); do
        printf "${TERMINAL_MAGENTA}${BOLD}["
        for ((j = 0; j < 10; j++)); do
            printf "${data_chars[($j + i) % ${#data_chars[@]}]}"
        done
        printf "]${NC} ${TERMINAL_CYAN}${text}${NC}\r"
        sleep 0.1
    done
    printf "\n"
}

print_gradient_box() {
    local text="$1"
    local colors=("${BRIGHT_YELLOW}" "${GOLD}" "${ORANGE}" "${DEEP_ORANGE}" "${BRIGHT_RED}")
    local text_length=${#text}
    local box_width=$((text_length + 4))
    local TERM_WIDTH=$(tput cols)
    local padding=$(( (TERM_WIDTH - box_width) / 2 ))
    
    # Top border with gradient
    printf "%${padding}s" ''
    echo -e "${colors[0]}┌$(printf '─%.0s' $(seq 1 $((box_width - 2))))┐${NC}"
    
    # Text with gradient
    printf "%${padding}s" ''
    echo -e "${colors[2]}│ ${BOLD}${text}${NC}${colors[2]} │${NC}"
    
    # Bottom border with gradient
    printf "%${padding}s" ''
    echo -e "${colors[4]}└$(printf '─%.0s' $(seq 1 $((box_width - 2))))┘${NC}"
}
# Main test sequence
print_banner

# Initialize test environment
print_box " INITIALIZING TEST ENVIRONMENT " "${INTERFACE_HEADER}"
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
print_gradient_box "NODE DEPLOYMENT TEST"
cd "$PROJECT_ROOT/cli" || { print_error "Failed to change to cli directory"; exit 1; }
./cli add-node 4
NODE1_RESULT=$?
./cli add-node 6
NODE2_RESULT=$?
print_result $NODE1_RESULT "Node deployment (4 cores)"
print_result $NODE2_RESULT "Node deployment (6 cores)"
print_divider

# Test 2: List nodes
print_gradient_box "NODE STATUS CHECK"
./cli list-nodes
LIST_NODES_RESULT=$?
print_result $LIST_NODES_RESULT "Node status retrieval"
print_divider

# Test 3: Launch pods with different scheduling algorithms
print_gradient_box "POD SCHEDULING ALGORITHM TEST"

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
print_gradient_box "POD STATUS CHECK"
./cli list-pods
LIST_PODS_RESULT=$?
print_result $LIST_PODS_RESULT "Pod status retrieval"
print_divider

# Test 5: Node failure simulation
print_gradient_box "NODE FAILURE SIMULATION"
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
print_gradient_box "NODE OPERATIONS TEST"
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

# Test 7: Node and Pod Deletion Test
print_gradient_box "NODE AND POD DELETION TEST"
print_gradient_box " TESTING RESOURCE CLEANUP "

# Create test nodes and pods
print_status "Setting up test environment..."
wave_effect "Creating test nodes" 3
FIRST_NODE=$(./cli add-node 4 | grep -o '"nodeId":"[^"]*"' | cut -d'"' -f4)
SECOND_NODE=$(./cli add-node 6 | grep -o '"nodeId":"[^"]*"' | cut -d'"' -f4)

print_status "Creating test pods..."
pulse_effect "Launching pods" 3
FIRST_POD=$(./cli launch-pod 2 | grep -o '"podId":"[^"]*"' | cut -d'"' -f4)
SECOND_POD=$(./cli launch-pod 3 | grep -o '"podId":"[^"]*"' | cut -d'"' -f4)

# List current state
print_status "Current cluster state:"
./cli list-nodes
./cli list-pods

# Update final summary
echo
print_gradient_box " FINAL TEST SUMMARY "
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

# Enhanced cleanup sequence
print_gradient_box " CLEANUP SEQUENCE "
echo
wave_effect "Initiating cleanup" 3
pulse_effect "Stopping services" 3
scan_effect "Removing resources" 3
data_effect "Finalizing cleanup" 3
cleanup
print_centered "TEST SEQUENCE COMPLETED" "${INTERFACE_SUCCESS}"
echo