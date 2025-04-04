export interface Node {
  ID: string;
  CPUCores: number;
  AvailableCPU: number;
  Pods: string[];
  HealthStatus: string;
  LastHeartbeat: string;
}

export interface Pod {
  ID: string;
  CPURequired: number;
  NodeID: string;
}

export interface AddNodeRequest {
  cpuCores: number;
}

export interface AddPodRequest {
  cpuRequired: number;
} 