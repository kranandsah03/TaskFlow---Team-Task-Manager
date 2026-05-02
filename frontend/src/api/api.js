import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const getUsers = () => API.get('/auth/users');

// Projects
export const getProjects = () => API.get('/projects');
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const addMemberToProject = (id, data) => API.patch(`/projects/${id}/members`, data);

// Tasks
export const getTasks = (projectId) =>
  API.get('/tasks', { params: projectId ? { projectId } : {} });
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.patch(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const getDashboardStats = () => API.get('/tasks/stats');

export default API;
