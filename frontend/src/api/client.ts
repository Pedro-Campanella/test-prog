import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL?.trim() || ''

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

const TOKEN_KEY = 'rs_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const t = getStoredToken()
  if (t) {
    config.headers.Authorization = `Bearer ${t}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = String(err.config?.url ?? '')
    if (
      err.response?.status === 401 &&
      !url.includes('/api/login') &&
      !url.includes('/api/register')
    ) {
      setStoredToken(null)
      localStorage.removeItem('rs_user')
      window.location.assign('/login')
    }
    return Promise.reject(err)
  },
)
