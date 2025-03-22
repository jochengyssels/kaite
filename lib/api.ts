import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:8000';

// Default headers for all requests
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: defaultHeaders,
  // This allows browser to include credentials like cookies
  withCredentials: true, 
});

// API utility functions
export const api = {
  // Chat API
  chat: async (message: string) => {
    try {
      const response = await apiClient.post('/api/chat', { message });
      return response.data;
    } catch (error) {
      console.error('Error in chat API:', error);
      throw error;
    }
  },
  
  // Forecast API
  getForecast: async (latitude: number, longitude: number) => {
    try {
      const response = await apiClient.get(`/api/forecast?latitude=${latitude}&longitude=${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Error in forecast API:', error);
      throw error;
    }
  }
};

export default api; 