import axios from 'axios';
import { Node, AddNodeRequest, AddPodRequest } from '../types';

const API_BASE_URL = 'http://localhost:8080';

export const api = {
  // Node operations
  getNodes: async (): Promise<Record<string, Node>> => {
    const response = await axios.get(`${API_BASE_URL}/nodes`);
    return response.data;
  },

  addNode: async (request: AddNodeRequest): Promise<string> => {
    const response = await axios.post(`${API_BASE_URL}/nodes`, request);
    return response.data;
  },

  // Pod operations
  launchPod: async (request: AddPodRequest): Promise<string> => {
    const response = await axios.post(`${API_BASE_URL}/pods`, request);
    return response.data;
  }
}; 