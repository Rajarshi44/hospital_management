import { ApiClient } from './api-client'

export type UserRole = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "LAB_TECHNICIAN" | "PHARMACIST" | "PATIENT"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  avatar?: string | null
  phone?: string | null
  address?: string | null
  dateOfBirth?: Date | null
  createdAt: Date
  updatedAt: Date
}

// Helper function to get full name from user
export function getUserFullName(user: User | null): string {
  if (!user) return ''
  return `${user.firstName} ${user.lastName}`.trim()
}

// Helper function to get initials from user
export function getUserInitials(user: User | null): string {
  if (!user) return ''
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  address?: string
  dateOfBirth?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
  expiresIn: number
}

// Authentication service with backend API integration
export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await ApiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      })

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      // Store user data
      this.currentUser = response.user
      localStorage.setItem('user', JSON.stringify(response.user))

      return response.user
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  async logout(): Promise<void> {
    // Clear tokens and user data
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    this.currentUser = null
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Try to get user from localStorage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr)
          return this.currentUser
        } catch {
          return null
        }
      }
    }

    return null
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await ApiClient.post<AuthResponse>('/auth/register', userData)

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      // Store user data
      this.currentUser = response.user
      localStorage.setItem('user', JSON.stringify(response.user))

      return response.user
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await ApiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      })

      // Update tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      // Update user data
      this.currentUser = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error) {
      // If refresh fails, logout user
      await this.logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  async getCurrentUserFromAPI(): Promise<User> {
    try {
      const user = await ApiClient.get<User>('/auth/me', true)
      this.currentUser = user
      localStorage.setItem('user', JSON.stringify(user))
      return user
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user')
    }
  }

  async updateProfile(updateData: Partial<RegisterData>): Promise<User> {
    try {
      const user = await ApiClient.put<User>('/auth/profile', updateData, true)
      this.currentUser = user
      localStorage.setItem('user', JSON.stringify(user))
      return user
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }
}
