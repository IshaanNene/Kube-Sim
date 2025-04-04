export interface Node {
  ID: string;
  CPUCores: number;
  AvailableCPU: number;
  Pods: string[];
  HealthStatus: string;
  LastHeartbeat: string;
  HeartbeatCount: number;
}

export interface Pod {
  ID: string;
  CPURequired: number;
  NodeID: string;
  Status: string;
  CreatedAt: string;
}

export interface AddNodeRequest {
  cpuCores: number;
}

export interface AddPodRequest {
  cpuRequired: number;
} 