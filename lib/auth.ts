export type UserRole = "admin" | "doctor" | "nurse" | "receptionist" | "pharmacist" | "patient"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  department?: string
  specialization?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock authentication service
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
    // Mock login - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock user data based on email
    const mockUsers: Record<string, User> = {
      "admin@hospital.com": {
        id: "1",
        email: "admin@hospital.com",
        name: "Dr. Sarah Johnson",
        role: "admin",
        avatar: "/caring-doctor.png",
        department: "Administration",
      },
      "doctor@hospital.com": {
        id: "2",
        email: "doctor@hospital.com",
        name: "Dr. Michael Chen",
        role: "doctor",
        avatar: "/caring-doctor.png",
        department: "Cardiology",
        specialization: "Interventional Cardiology",
      },
      "nurse@hospital.com": {
        id: "3",
        email: "nurse@hospital.com",
        name: "Emily Rodriguez",
        role: "nurse",
        avatar: "/diverse-nurses-team.png",
        department: "Emergency",
      },
      "receptionist@hospital.com": {
        id: "4",
        email: "receptionist@hospital.com",
        name: "Lisa Thompson",
        role: "receptionist",
        avatar: "/friendly-receptionist.png",
        department: "Front Desk",
      },
      "pharmacist@hospital.com": {
        id: "5",
        email: "pharmacist@hospital.com",
        name: "David Park",
        role: "pharmacist",
        avatar: "/pharmacist-consultation.png",
        department: "Pharmacy",
      },
      "patient@hospital.com": {
        id: "6",
        email: "patient@hospital.com",
        name: "John Smith",
        role: "patient",
        avatar: "/patient-consultation.png",
      },
    }

    const user = mockUsers[email]
    if (!user) {
      throw new Error("Invalid credentials")
    }

    this.currentUser = user
    localStorage.setItem("hospital_user", JSON.stringify(user))
    localStorage.removeItem("hospital_logout") // Clear logout flag
    return user
  }

  async logout(): Promise<void> {
    this.currentUser = null
    localStorage.removeItem("hospital_user")
    // Also remove auto-login flag
    localStorage.setItem("hospital_logout", "true")
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser

    const stored = localStorage.getItem("hospital_user")
    if (stored) {
      this.currentUser = JSON.parse(stored)
      return this.currentUser
    }

    // Check if user explicitly logged out
    const hasLoggedOut = localStorage.getItem("hospital_logout")
    if (hasLoggedOut) {
      return null
    }

    // Development mode: auto-login as admin for testing (only if not logged out)
    if (process.env.NODE_ENV === "development") {
      const devUser: User = {
        id: "dev-admin",
        email: "admin@hospital.com",
        name: "Dr. Sarah Johnson",
        role: "admin",
        avatar: "/caring-doctor.png",
        department: "Administration",
      }
      this.currentUser = devUser
      localStorage.setItem("hospital_user", JSON.stringify(devUser))
      return devUser
    }

    return null
  }

  async register(userData: Omit<User, "id">): Promise<User> {
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
    }

    this.currentUser = user
    localStorage.setItem("hospital_user", JSON.stringify(user))
    return user
  }
}
