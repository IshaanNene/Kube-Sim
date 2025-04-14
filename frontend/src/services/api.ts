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

  stopNode: async (nodeId: string): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/nodes/${nodeId}/stop`);
    } catch (error: any) {
      console.error('Error stopping node:', error);
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to stop node. Is the API server running?');
    }
  },

  deleteNode: async (nodeId: string): Promise<void> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/nodes/${nodeId}`);
      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete node');
      }
    } catch (error: any) {
      console.error('Error deleting node:', error);
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw error;
    }
  },

  restartNode: async (nodeId: string): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/nodes/${nodeId}/restart`);
    } catch (error: any) {
      console.error('Error restarting node:', error);
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to restart node. Is the API server running?');
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
  },

  deletePod: async (podId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/pods/${podId}`);
    } catch (error: any) {
      console.error('Error deleting pod:', error);
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to delete pod. Is the API server running?');
    }
  },

  restartPod: async (podId: string): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/pods/${podId}/restart`);
    } catch (error: any) {
      console.error('Error restarting pod:', error);
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to restart pod. Is the API server running?');
    }
  },

  setScheduler: async (algorithm: string): Promise<void> => {
    const response = await fetch('http://localhost:8080/scheduler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ algorithm }),
    });

    if (!response.ok) {
      throw new Error('Failed to set scheduler algorithm');
    }
  },
};

export { api }; 