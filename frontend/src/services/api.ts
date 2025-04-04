import axios from 'axios';
import { Node, AddNodeRequest, AddPodRequest } from '../types';

const API_BASE_URL = 'http://localhost:8080';

const api = {
  // Node operations
  getNodes: async (): Promise<Record<string, Node>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nodes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching nodes:', error);
      throw new Error('Failed to fetch nodes. Is the API server running?');
    }
  },

  addNode: async (request: AddNodeRequest): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/nodes`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error adding node:', error);
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to add node. Is the API server running and Docker available?');
    }
  },

  // Pod operations
  launchPod: async (request: AddPodRequest): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pods`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error launching pod:', error);
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to launch pod. Are there healthy nodes with sufficient CPU?');
    }
  }
};

export { api }; 