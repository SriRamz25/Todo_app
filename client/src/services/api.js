import axios from "axios";

// Base URL for your backend API
const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// API service functions
export const todoAPI = {
  // Get all todos
  getTodos: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.filter) params.append("filter", filters.filter);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.priority) params.append("priority", filters.priority);

      const response = await api.get(`/todos?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch todos");
    }
  },

  // Create new todo
  createTodo: async (todoData) => {
    try {
      const response = await api.post("/todos", {
        text: todoData.text,
        priority: todoData.priority || "medium",
        category: todoData.category,
        dueDate: todoData.dueDate,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating todo:", error);
      throw new Error(error.response?.data?.message || "Failed to create todo");
    }
  },

  // Update todo
  updateTodo: async (id, updates) => {
    try {
      const response = await api.put(`/todos/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw new Error(error.response?.data?.message || "Failed to update todo");
    }
  },

  // Toggle todo completion
  toggleTodo: async (id, completed) => {
    try {
      const response = await api.put(`/todos/${id}`, {
        completed,
        completedAt: completed ? new Date() : null,
      });
      return response.data;
    } catch (error) {
      console.error("Error toggling todo:", error);
      throw new Error(error.response?.data?.message || "Failed to toggle todo");
    }
  },

  // Delete todo
  deleteTodo: async (id) => {
    try {
      const response = await api.delete(`/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw new Error(error.response?.data?.message || "Failed to delete todo");
    }
  },

  // Update todo priority
  updatePriority: async (id, priority) => {
    try {
      const response = await api.put(`/todos/${id}`, { priority });
      return response.data;
    } catch (error) {
      console.error("Error updating priority:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update priority"
      );
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error("Backend server is not responding");
    }
  },
};

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response received:`, response.status, response.statusText);
    return response;
  },
  (error) => {
    if (error.code === "ECONNREFUSED") {
      console.error("Backend server is not running!");
      throw new Error(
        "Cannot connect to server. Please make sure the backend is running on port 5000."
      );
    }

    if (error.response?.status === 404) {
      console.error("API endpoint not found:", error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default api;
