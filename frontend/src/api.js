/**
 * Axios instance with JWT interceptor.
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

export const companiesApi = {
  list: () => api.get('/companies').then((r) => r.data),
  get: (id) => api.get(`/companies/${id}`).then((r) => r.data),
  create: (data) => api.post('/companies', data).then((r) => r.data),
  update: (id, data) => api.patch(`/companies/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/companies/${id}`),
}

export const applicationsApi = {
  list: (params = {}) => api.get('/applications', { params }).then((r) => r.data),
  get: (id) => api.get(`/applications/${id}`).then((r) => r.data),
  create: (data) => api.post('/applications', data).then((r) => r.data),
  update: (id, data) => api.patch(`/applications/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/applications/${id}`),
}

export const interviewsApi = {
  list: (appId) => api.get(`/applications/${appId}/interviews`).then((r) => r.data),
  create: (appId, data) =>
    api.post(`/applications/${appId}/interviews`, data).then((r) => r.data),
  update: (id, data) => api.patch(`/interviews/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/interviews/${id}`),
}