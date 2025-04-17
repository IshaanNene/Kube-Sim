#!/bin/bash

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
NEON_BLUE='\033[38;5;33m'      
ELECTRIC_CYAN='\033[38;5;51m'   
DEEP_PURPLE='\033[38;5;93m'     
VIBRANT_MAGENTA='\033[38;5;201m' 
TERMINAL_CYAN='\033[38;5;87m'   
RESET='\033[0m'  
BRIGHT_YELLOW='\033[38;5;226m'  
GOLD='\033[38;5;220m'           
ORANGE='\033[38;5;208m'         
DEEP_ORANGE='\033[38;5;202m'    
BRIGHT_RED='\033[38;5;196m'     
HEADER_COLOR='\033[38;5;214m'   
RESET='\033[0m'                 

BRIGHT_YELLOW='\033[38;5;226m'  
GOLD='\033[38;5;220m'           
ORANGE='\033[38;5;208m'         
DEEP_ORANGE='\033[38;5;202m'    
BRIGHT_RED='\033[38;5;196m'     
NC='\033[0m'                    
BOLD='\033[1m'                  

NC='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
BLINK='\033[5m'
UNDERLINE='\033[4m'

TERM_WIDTH=$(tput cols)

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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

print_centered() {
    local text="$1"
    local color="$2"
    local padding=$(( (TERM_WIDTH - ${#text}) / 2 ))
    printf "%${padding}s" ''
    echo -e "${color}${text}${NC}"
}

print_box() {
    local text="$1"
    local color="$2"
    local text_length=${#text}
    local box_width=$((text_length + 4))
    local padding=$(( (TERM_WIDTH - box_width) / 2 ))
    
    printf "%${padding}s" ''
    echo -e "${color}┌$(printf '─%.0s' $(seq 1 $((box_width - 2))))┐${NC}"
    
    printf "%${padding}s" ''
    echo -e "${color}│ ${BOLD}${text}${NC}${color} │${NC}"
    
    printf "%${padding}s" ''
    echo -e "${color}└$(printf '─%.0s' $(seq 1 $((box_width - 2))))┘${NC}"
}

print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${INTERFACE_SUCCESS}${BOLD}[✓]${NC} ${INTERFACE_TEXT}$2 ${INTERFACE_SUCCESS}[SUCCESS]${NC}"
    else
        echo -e "${INTERFACE_ERROR}${BOLD}[✗]${NC} ${TERMINAL_MAGENTA}$2 ${INTERFACE_ERROR}[FAILED]${NC}"
    fi
}

print_status() {
    echo -e "${TERMINAL_BLUE}${BOLD}[*]${NC} ${INTERFACE_TEXT}$1${NC}"
}

print_warning() {
    echo -e "${INTERFACE_WARNING}${BOLD}[!]${NC} ${INTERFACE_WARNING}$1${NC}"
}

print_success() {
    echo -e "${INTERFACE_SUCCESS}${BOLD}[+]${NC} ${INTERFACE_TEXT}$1${NC}"
}

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
    sleep 5
}

print_divider() {
    echo
    print_centered "──────────────────────────────────────" "${TERMINAL_BLUE}"
    echo
}

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

check_docker() {
    print_status "Initializing Docker connection..."
    simulate_loading "Establishing connection to Docker daemon" 5
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker daemon connection established"
}

kill_existing_api() {
    print_status "Checking for existing API server instances..."
    if lsof -i :8080 > /dev/null; then
        print_warning "Found existing process on port 8080"
        lsof -ti :8080 | xargs kill -9
        print_success "Terminated existing API server"
        sleep 2
    fi
}

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

make_api_call() {
    local url=$1
    local method=${2:-GET}
    local timeout=10

    if ! curl -s -X "$method" --connect-timeout "$timeout" --max-time "$timeout" "$url" 2>/dev/null; then
        return 1
    fi
    return 0
}

cleanup() {
    print_status "Initiating cleanup sequence..."
    docker ps -a --filter "name=node-" -q | xargs -r docker stop
    docker ps -a --filter "name=node-" -q | xargs -r docker rm
    pkill -f "./api-server" || true
    print_success "Cleanup completed"
}

trap cleanup EXIT

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
    
    printf "%${padding}s" ''
    echo -e "${colors[0]}┌$(printf '─%.0s' $(seq 1 $((box_width - 2))))┐${NC}"
    
    printf "%${padding}s" ''
    echo -e "${colors[2]}│ ${BOLD}${text}${NC}${colors[2]} │${NC}"
    
    printf "%${padding}s" ''
    echo -e "${colors[4]}└$(printf '─%.0s' $(seq 1 $((box_width - 2))))┘${NC}"
}

print_banner

print_box " INITIALIZING TEST ENVIRONMENT " "${INTERFACE_HEADER}"
echo

check_docker

kill_existing_api

print_status "Launching API server..."
cd "$PROJECT_ROOT/api-server" || { print_error "Failed to change to api-server directory"; exit 1; }
go build -o api-server || { print_error "Failed to build api-server"; exit 1; }
./api-server &
API_PID=$!

for i in {1..10}; do
    progress_bar $i 10
    echo -en "\r"
    sleep 1
done
echo

print_gradient_box "NODE DEPLOYMENT TEST"
cd "$PROJECT_ROOT/cli" || { print_error "Failed to change to cli directory"; exit 1; }
./cli add-node 4
NODE1_RESULT=$?
./cli add-node 6
NODE2_RESULT=$?
print_result $NODE1_RESULT "Node deployment (4 cores)"
print_result $NODE2_RESULT "Node deployment (6 cores)"
print_divider

print_gradient_box "NODE STATUS CHECK"
./cli list-nodes
LIST_NODES_RESULT=$?
print_result $LIST_NODES_RESULT "Node status retrieval"
print_divider

print_gradient_box "POD SCHEDULING ALGORITHM TEST"

print_status "Testing First-Fit scheduling algorithm..."
./cli set-scheduler first-fit
./cli launch-pod 2
FIRST_FIT_RESULT=$?
print_result $FIRST_FIT_RESULT "First-Fit pod deployment"

print_status "Testing Best-Fit scheduling algorithm..."
./cli set-scheduler best-fit
./cli launch-pod 3
BEST_FIT_RESULT=$?
print_result $BEST_FIT_RESULT "Best-Fit pod deployment"

print_status "Testing Worst-Fit scheduling algorithm..."
./cli set-scheduler worst-fit
./cli launch-pod 2
WORST_FIT_RESULT=$?
print_result $WORST_FIT_RESULT "Worst-Fit pod deployment"
print_divider

print_gradient_box "POD STATUS CHECK"
./cli list-pods
LIST_PODS_RESULT=$?
print_result $LIST_PODS_RESULT "Pod status retrieval"
print_divider

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

print_gradient_box "NODE OPERATIONS TEST"
# Get a healthy node ID from the API directly
HEALTHY_NODE=$(curl -s http://localhost:8080/nodes | jq -r 'to_entries | map(select(.value.HealthStatus == "Healthy")) | .[0].key')

if [ ! -z "$HEALTHY_NODE" ]; then
    print_status "Testing node stop operation..."
    # First remove any pods from the node
    print_status "Removing pods from node before operations..."
    POD_IDS=$(curl -s http://localhost:8080/pods | jq -r '.[] | select(.NodeID == "'$HEALTHY_NODE'") | .ID')
    for POD_ID in $POD_IDS; do
        ./cli delete-pod "$POD_ID"
        sleep 2
    done
    
    # Now stop the node
    print_status "Stopping node $HEALTHY_NODE..."
    ./cli stop-node "$HEALTHY_NODE"
    NODE_STOP_RESULT=$?
    print_result $NODE_STOP_RESULT "Node stop operation"
    
    if [ $NODE_STOP_RESULT -eq 0 ]; then
        print_status "Waiting for node to stop..."
        sleep 5
        
        print_status "Testing node restart operation..."
        ./cli restart-node "$HEALTHY_NODE"
        NODE_RESTART_RESULT=$?
        print_result $NODE_RESTART_RESULT "Node restart operation"
        
        # Wait for node to become healthy again
        print_status "Waiting for node to recover..."
        sleep 10
        
        # Verify node is healthy
        NODE_STATUS=$(curl -s http://localhost:8080/nodes | jq -r ".[\"$HEALTHY_NODE\"].HealthStatus")
        if [ "$NODE_STATUS" = "Healthy" ]; then
            print_success "Node successfully restarted and healthy"
        else
            print_error "Node failed to recover after restart (Status: $NODE_STATUS)"
            NODE_RESTART_RESULT=1
        fi
    else
        print_error "Node stop operation failed"
        NODE_RESTART_RESULT=1
    fi
else
    print_error "No healthy node found for operations test"
    NODE_STOP_RESULT=1
    NODE_RESTART_RESULT=1
fi

print_divider

# Final Test Summary
print_gradient_box "FINAL TEST SUMMARY"
echo

# Store all test results
TOTAL_TESTS=0
PASSED_TESTS=0

print_test_result() {
    local result=$1
    local description=$2
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $result -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        printf "${NEON_GREEN}${BOLD}[✓]${NC} %-50s ${NEON_GREEN}[PASSED]${NC}\n" "$description"
    else
        printf "${NEON_RED}${BOLD}[✗]${NC} %-50s ${NEON_RED}[FAILED]${NC}\n" "$description"
    fi
}

# Print individual test results
print_test_result $NODE1_RESULT "Node Deployment (4 cores)"
print_test_result $NODE2_RESULT "Node Deployment (6 cores)"
print_test_result $LIST_NODES_RESULT "Node Status Check"
print_test_result $FIRST_FIT_RESULT "First-Fit Scheduling"
print_test_result $BEST_FIT_RESULT "Best-Fit Scheduling"
print_test_result $WORST_FIT_RESULT "Worst-Fit Scheduling"
print_test_result $LIST_PODS_RESULT "Pod Status Check"
print_test_result $NODE_FAILURE_RESULT "Node Failure Detection"
print_test_result $NODE_STOP_RESULT "Node Stop Operation"
print_test_result $NODE_RESTART_RESULT "Node Restart Operation"

echo
print_centered "TEST SUMMARY" "${NEON_BLUE}"
print_centered "────────────" "${NEON_BLUE}"
echo

# Calculate percentage
PASS_PERCENTAGE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))

# Print summary with color based on pass percentage
if [ $PASS_PERCENTAGE -eq 100 ]; then
    COLOR=${NEON_GREEN}
elif [ $PASS_PERCENTAGE -ge 80 ]; then
    COLOR=${NEON_YELLOW}
else
    COLOR=${NEON_RED}
fi

printf "${COLOR}Total Tests: %d${NC}\n" $TOTAL_TESTS
printf "${COLOR}Tests Passed: %d${NC}\n" $PASSED_TESTS
printf "${COLOR}Tests Failed: %d${NC}\n" $(( TOTAL_TESTS - PASSED_TESTS ))
printf "${COLOR}Pass Rate: %d%%${NC}\n" $PASS_PERCENTAGE

echo
if [ $PASS_PERCENTAGE -eq 100 ]; then
    print_centered "ALL TESTS PASSED SUCCESSFULLY! 🎉" "${NEON_GREEN}"
elif [ $PASS_PERCENTAGE -ge 80 ]; then
    print_centered "MOST TESTS PASSED - REVIEW FAILURES 🤔" "${NEON_YELLOW}"
else
    print_centered "SIGNIFICANT TEST FAILURES - NEEDS ATTENTION ⚠️" "${NEON_RED}"
fi
echo

cleanup