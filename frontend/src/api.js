const normalizeBase = (value) => value.replace(/\/+$/, '')

const API_BASE = import.meta.env.VITE_API_BASE
  ? normalizeBase(import.meta.env.VITE_API_BASE)
  : '/api'

const readErrorMessage = async (response) => {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      const payload = await response.json()
      return payload.error || payload.message || 'API Error'
    } catch {
      return 'API Error'
    }
  }

  const text = await response.text()
  return text || 'API Error'
}

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.status === 204 ? null : response.json()
}

// Auth APIs
export const signup = (name, email, password) =>
  apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

export const login = (email, password) =>
  apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const getCurrentUser = () => apiCall('/auth/me')

// Project APIs
export const createProject = (name, description) =>
  apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })

export const listProjects = () => apiCall('/projects')

export const getProject = (projectId) => apiCall(`/projects/${projectId}`)

export const addMember = (projectId, userId, role) =>
  apiCall(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId, role }),
  })

export const getMembers = (projectId) => apiCall(`/projects/${projectId}/members`)

// Task APIs
export const createTask = (projectId, title, description, assigneeId, dueDate) =>
  apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify({ projectId, title, description, assigneeId, dueDate }),
  })

export const getTasks = () => apiCall('/tasks')

export const getProjectTasks = (projectId) => apiCall(`/tasks/project/${projectId}`)

export const updateTask = (taskId, status, assigneeId, dueDate) =>
  apiCall(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, assigneeId, dueDate }),
  })

export const deleteTask = (taskId) =>
  apiCall(`/tasks/${taskId}`, { method: 'DELETE' })

export const getDashboardStats = () => apiCall('/tasks/dashboard/stats')
