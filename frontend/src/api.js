import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch (_) {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export const auth = {
  register: (username, email, password, password_confirm) =>
    api.post('/auth/register/', { username, email, password, password_confirm }),
  login: (username, password) =>
    api.post('/auth/token/', { username, password }),
}

export const resumes = {
  list: () => api.get('/resumes/'),
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/resumes/upload/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const match = {
  analyze: (job_description) =>
    api.post('/match/', { job_description }),
}

export const dashboard = {
  get: () => api.get('/dashboard/'),
}

export default api
