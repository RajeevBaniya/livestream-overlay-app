import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const overlayAPI = {
  async createOverlay(overlayData) {
    try {
      const response = await api.post('/overlays', overlayData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create overlay' 
      };
    }
  },

  async getOverlays(streamId = 'default') {
    try {
      const response = await api.get('/overlays', {
        params: { streamId }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch overlays' 
      };
    }
  },

  async getOverlay(overlayId) {
    try {
      const response = await api.get(`/overlays/${overlayId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch overlay' 
      };
    }
  },

  async updateOverlay(overlayId, updates) {
    try {
      const response = await api.put(`/overlays/${overlayId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update overlay' 
      };
    }
  },

  async deleteOverlay(overlayId) {
    try {
      const response = await api.delete(`/overlays/${overlayId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete overlay' 
      };
    }
  },

  async deleteStreamOverlays(streamId) {
    try {
      const response = await api.delete(`/overlays/stream/${streamId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete overlays' 
      };
    }
  },

  async healthCheck() {
    try {
      const response = await api.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'API is not reachable' };
    }
  }
};

export default api;

