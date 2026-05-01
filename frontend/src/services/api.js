import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend is down / unreachable, error.response is undefined.
    // Let the caller show a useful message instead of hard redirecting.
    if (!error.response) {
      return Promise.reject(error)
    }

    // Avoid redirect loop when the /auth/login request itself returns 401.
    const requestUrl = String(error.config?.url || '')
    const isAuthLoginCall = requestUrl.includes('/auth/login')

    if (error.response?.status === 401 && !isAuthLoginCall) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => {
    const params = new URLSearchParams();
    params.append('username', data.email);
    params.append('password', data.password);
    return API.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
}

export const usersAPI = {
  getMe: () => API.get('/users/me'),
  getAll: () => API.get('/users/'),
}

export const projectsAPI = {
  getAll: () => API.get('/projects/'),
  create: (data) => API.post('/projects/', data),
  getOne: (id) => API.get(`/projects/${id}`),
  addMember: (projectId, data) => API.post(`/projects/${projectId}/add-member`, data),
  removeMember: (projectId, userId) => API.delete(`/projects/${projectId}/members/${userId}`),
}

export const commentsAPI = {
  getByTask: (taskId) => API.get(`/comments/task/${taskId}`),
  create: (data) => API.post('/comments/', data),
}

export const attachmentsAPI = {
  getByTask: (taskId) => API.get(`/attachments/task/${taskId}`),
  upload: (taskId, formData) => API.post(`/attachments/task/${taskId}`, formData),
}

export const tasksAPI = {
  getAll: (params) => API.get('/tasks/', { params }),
  create: (data) => API.post('/tasks/', data),
  getOne: (id) => API.get(`/tasks/${id}`),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
}

export const dashboardAPI = {
  getStats: () => API.get('/dashboard/'),
}

export default API