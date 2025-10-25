"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { type User, type AuthState, type RegisterData, AuthService } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (updateData: Partial<RegisterData>) => Promise<void>
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
    // Check if user is already logged in
    const initAuth = async () => {
      const user = authService.getCurrentUser()
      const token = localStorage.getItem("accessToken")
      console.log("🔑 Current token in initAuth:", token)

      if (user) {
        // Verify token is still valid by fetching current user from API
        try {
          const freshUser = await authService.getCurrentUserFromAPI()
          setAuthState({
            user: freshUser,
            isLoading: false,
            isAuthenticated: true,
          })
        } catch (error) {
          // Token is invalid or expired, try to refresh
          try {
            await authService.refreshToken()
            const freshUser = authService.getCurrentUser()
            setAuthState({
              user: freshUser,
              isLoading: false,
              isAuthenticated: !!freshUser,
            })
          } catch (refreshError) {
            // Refresh failed, logout user
            await authService.logout()
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            })
          }
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.login(email, password)
      const token = localStorage.getItem("accessToken")
      console.log("🔑 Token after login:", token)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    console.log("🔑 Token before logout:", localStorage.getItem("accessToken"))
    try {
      await authService.logout()
      console.log("🔑 Token after logout:", localStorage.getItem("accessToken"))
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    } catch (error) {
      // Even if logout fails on backend, clear local state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const register = async (userData: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.register(userData)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const refreshToken = async () => {
    try {
      await authService.refreshToken()
      const user = authService.getCurrentUser()
      const token = localStorage.getItem("accessToken")
      console.log("🔑 Token after refresh:", token)
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
      }))
    } catch (error) {
      // If refresh fails, logout
      await logout()
      throw error
    }
  }

  const updateProfile = async (updateData: Partial<RegisterData>) => {
    try {
      const user = await authService.updateProfile(updateData)
      setAuthState(prev => ({
        ...prev,
        user,
      }))
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        refreshToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Custom hook to get and log current token
export function useAuthToken() {
  const getCurrentToken = () => {
    const token = localStorage.getItem("accessToken")
    console.log("🔑 Current access token:", token)
    return token
  }

  const getRefreshToken = () => {
    const refreshToken = localStorage.getItem("refreshToken")
    console.log("🔄 Current refresh token:", refreshToken)
    return refreshToken
  }

  const logAllTokens = () => {
    const accessToken = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")
    console.log("🔑 All tokens:", { accessToken, refreshToken })
    return { accessToken, refreshToken }
  }

  return {
    getCurrentToken,
    getRefreshToken,
    logAllTokens,
  }
}
