import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      showToast('Network error. Please check your connection.')
    } else if (error.response.status >= 500) {
      showToast('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

// Simple toast notification
let toastTimeout: ReturnType<typeof setTimeout> | null = null

function showToast(message: string) {
  let el = document.getElementById('global-toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'global-toast'
    el.style.cssText =
      'position:fixed;bottom:1.5rem;right:1.5rem;background:#1f2937;color:#fff;padding:0.75rem 1.25rem;border-radius:10px;font-size:0.875rem;z-index:9999;opacity:0;transition:opacity 0.2s;max-width:360px;'
    document.body.appendChild(el)
  }
  el.textContent = message
  el.style.opacity = '1'
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    el!.style.opacity = '0'
  }, 4000)
}

export { showToast }

const Request = {
  async Get(url: string) {
    const response = await axiosInstance.get(url)
    return response.data
  },
  async Post(url: string, data: any) {
    const response = await axiosInstance.post(url, data)
    return response.data
  },
  async Put(url: string, data: any) {
    const response = await axiosInstance.put(url, data)
    return response.data
  },
  async Patch(url: string, data: any) {
    const response = await axiosInstance.patch(url, data)
    return response.data
  },
  async Delete(url: string) {
    const response = await axiosInstance.delete(url)
    return response.data
  },
}

export default Request
