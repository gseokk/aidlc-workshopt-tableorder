import axios from 'axios'
import { loadAdminAuth, loadTableAuth, clearAdminAuth, clearTableAuth } from '@/utils/authUtils'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.startsWith('/api/admin') || config.url?.startsWith('/api/sse')
  const adminAuth = loadAdminAuth()
  const tableAuth = loadTableAuth()
  const token = isAdminRoute ? adminAuth?.token : (tableAuth?.token ?? adminAuth?.token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith('/admin')
      if (isAdminRoute) {
        clearAdminAuth()
        window.location.href = '/admin/login'
      } else {
        clearTableAuth()
        window.location.href = '/setup'
      }
    }
    return Promise.reject(error)
  }
)
