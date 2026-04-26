import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const apiService = {
  runOptimization: async (city, numTowers, populationSize, generations, weights) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/run-optimization`, {
        city,
        num_towers: numTowers,
        population_size: populationSize,
        generations,
        weights
      });
      return response.data;
    } catch (error) {
      console.error('Error running optimization:', error);
      throw error;
    }
  },

  getOptimizationProgress: async (city) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/optimization-progress/${city}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching optimization progress:', error);
      throw error;
    }
  },

  getResults: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  },

  getResultFile: async (filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/results/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result file:', error);
      throw error;
    }
  },

  deleteResult: async (filename) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/results/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting result file:', error);
      throw error;
    }
  }
};

export default apiService;
