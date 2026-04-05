import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, getStoredToken, setStoredToken } from '../api/client'
import type { User } from '../types'

const USER_KEY = 'rs_user'

type AuthState = {
  token: string | null
  user: User | null
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function persistSession(token: string | null, user: User | null) {
  setStoredToken(token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<User | null>(() => readStoredUser())

  const applySession = useCallback((t: string, u: User) => {
    setToken(t)
    setUser(u)
    persistSession(t, u)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ token: string; user: User }>(
        '/api/login',
        { email, password },
      )
      applySession(data.token, data.user)
    },
    [applySession],
  )

  const register = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ token: string; user: User }>(
        '/api/register',
        { email, password },
      )
      applySession(data.token, data.user)
    },
    [applySession],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    persistSession(null, null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
