"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { type User, type AuthState, AuthService } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: Omit<User, "id">) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const authService = AuthService.getInstance()

  useEffect(() => {
    const user = authService.getCurrentUser()
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    })
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.login(email, password)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    await authService.logout()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const register = async (userData: Omit<User, "id">) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.register(userData)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  return <AuthContext.Provider value={{ ...authState, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
