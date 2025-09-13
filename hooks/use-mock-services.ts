"use client"

import { useState, useEffect } from "react"
import {
  AuthService,
  PatientService,
  AppointmentService,
  PrescriptionService,
  InventoryService,
  DashboardService,
  NotificationService,
} from "@/lib/mock-services"
import type { User, Patient, Appointment, Prescription, InventoryItem } from "@/lib/types"

// Auth Hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    if (token) {
      AuthService.getCurrentUser(token)
        .then(setUser)
        .catch(() => localStorage.removeItem("auth-token"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { user, token } = await AuthService.login(email, password)
    localStorage.setItem("auth-token", token)
    setUser(user)
    return user
  }

  const logout = async () => {
    await AuthService.logout()
    localStorage.removeItem("auth-token")
    setUser(null)
  }

  return { user, loading, login, logout }
}

// Patients Hook
export function usePatients(search?: string) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    PatientService.getPatients(search)
      .then(setPatients)
      .finally(() => setLoading(false))
  }, [search])

  return {
    patients,
    loading,
    refetch: () => {
      setLoading(true)
      PatientService.getPatients(search)
        .then(setPatients)
        .finally(() => setLoading(false))
    },
  }
}

// Appointments Hook
export function useAppointments(filters?: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AppointmentService.getAppointments(filters)
      .then(setAppointments)
      .finally(() => setLoading(false))
  }, [filters])

  return {
    appointments,
    loading,
    refetch: () => {
      setLoading(true)
      AppointmentService.getAppointments(filters)
        .then(setAppointments)
        .finally(() => setLoading(false))
    },
  }
}

// Prescriptions Hook
export function usePrescriptions(filters?: any) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    PrescriptionService.getPrescriptions(filters)
      .then(setPrescriptions)
      .finally(() => setLoading(false))
  }, [filters])

  return {
    prescriptions,
    loading,
    refetch: () => {
      setLoading(true)
      PrescriptionService.getPrescriptions(filters)
        .then(setPrescriptions)
        .finally(() => setLoading(false))
    },
  }
}

// Inventory Hook
export function useInventory(filters?: any) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    InventoryService.getInventory(filters)
      .then(setInventory)
      .finally(() => setLoading(false))
  }, [filters])

  return {
    inventory,
    loading,
    refetch: () => {
      setLoading(true)
      InventoryService.getInventory(filters)
        .then(setInventory)
        .finally(() => setLoading(false))
    },
  }
}

// Dashboard Hook
export function useDashboard(userRole: string) {
  const [stats, setStats] = useState<any>({})
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([DashboardService.getDashboardStats(userRole), DashboardService.getRecentActivity(userRole)])
      .then(([statsData, activitiesData]) => {
        setStats(statsData)
        setActivities(activitiesData)
      })
      .finally(() => setLoading(false))
  }, [userRole])

  return { stats, activities, loading }
}

// Notifications Hook
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    NotificationService.getNotifications(userId)
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [userId])

  return { notifications, loading, markAsRead: NotificationService.markAsRead }
}
