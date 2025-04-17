import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Node, AddNodeRequest, AddPodRequest } from '../types';

const API_BASE_URL = 'http://localhost:8080';

// Define custom config type that includes retry
interface CustomAxiosConfig extends AxiosRequestConfig {
  retry?: number;
}

// Create axios instance with defaults
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add retry interceptor
axiosInstance.interceptors.response.use(undefined, async (err: AxiosError) => {
  const config = err.config as CustomAxiosConfig;
  if (!config || typeof config.retry === 'undefined') {
    return Promise.reject(err);
  }
  
  if (config.retry <= 0) {
    return Promise.reject(err);
  }
  
  config.retry -= 1;
  console.log(`Retrying request to ${config.url}, ${config.retry} retries left`);
  
  // Exponential backoff
  const backoffDelay = Math.min(1000 * (2 ** (2 - config.retry)), 10000);
  await new Promise(resolve => setTimeout(resolve, backoffDelay));
  
  try {
    const response = await axiosInstance(config);
    return response;
  } catch (retryError) {
    return Promise.reject(retryError);
  }
});

// Error handler helper
const handleApiError = (error: any, customMessage: string): never => {
  console.error(customMessage, error);
  
  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timed out. The server might be busy, please try again.');
  }
  
  if (error.response?.status === 404) {
    throw new Error('Resource not found. It might have been deleted or never existed.');
  }
  
  if (error.response?.status === 400) {
    throw new Error(error.response.data || 'Invalid request. Please check your input.');
  }
  
  if (error.response?.data) {
    throw new Error(error.response.data);
  }
  
  if (!error.response) {
    throw new Error('Cannot connect to the server. Please ensure the API server is running.');
  }
  
  throw new Error(`${customMessage}. Please try again later.`);
};

const api = {
  // Node operations
  getNodes: async (): Promise<Record<string, Node>> => {
    try {
      const response = await axiosInstance.get('/nodes', { 
        retry: 2,
        timeout: 10000 // 10 second timeout for GET requests
      } as CustomAxiosConfig);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch nodes');
    }
  },

  addNode: async (request: AddNodeRequest): Promise<string> => {
    try {
      const response = await axiosInstance.post('/nodes', request, { 
        retry: 1,
        timeout: 30000 // 30 second timeout for node creation
      } as CustomAxiosConfig);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to add node');
    }
  },

  stopNode: async (nodeId: string): Promise<void> => {
    try {
      await axiosInstance.post(`/nodes/${nodeId}/stop`, {}, { 
        retry: 2,
        timeout: 20000 // 20 second timeout for stop operation
      } as CustomAxiosConfig);
    } catch (error) {
      handleApiError(error, 'Failed to stop node');
    }
  },

  deleteNode: async (nodeId: string): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/nodes/${nodeId}`, { 
        retry: 2,
        timeout: 20000 // 20 second timeout for delete operation
      } as CustomAxiosConfig);
      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete node');
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete node');
    }
  },

  restartNode: async (nodeId: string): Promise<void> => {
    try {
      await axiosInstance.post(`/nodes/${nodeId}/restart`, {}, { 
        retry: 3,
        timeout: 30000 // 30 second timeout for restart operation
      } as CustomAxiosConfig);
    } catch (error) {
      handleApiError(error, 'Failed to restart node');
    }
  },

  // Pod operations
  launchPod: async (request: AddPodRequest): Promise<string> => {
    try {
      const response = await axiosInstance.post('/pods', request, { 
        retry: 2,
        timeout: 20000 // 20 second timeout for pod creation
      } as CustomAxiosConfig);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to launch pod');
    }
  },

  deletePod: async (podId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/pods/${podId}`, { 
        retry: 2,
        timeout: 20000 // 20 second timeout for pod deletion
      } as CustomAxiosConfig);
    } catch (error) {
      handleApiError(error, 'Failed to delete pod');
    }
  },

  restartPod: async (podId: string): Promise<void> => {
    try {
      await axiosInstance.post(`/pods/${podId}/restart`, {}, { 
        retry: 3,
        timeout: 30000 // 30 second timeout for pod restart
      } as CustomAxiosConfig);
    } catch (error) {
      handleApiError(error, 'Failed to restart pod');
    }
  },

  // Scheduler operations
  setScheduler: async (algorithm: string): Promise<void> => {
    try {
      await axiosInstance.post('/scheduler', { algorithm }, {
        retry: 2,
        timeout: 10000 // 10 second timeout for scheduler update
      } as CustomAxiosConfig);
    } catch (error) {
      handleApiError(error, 'Failed to update scheduler algorithm');
    }
  }
};

export { api }; 