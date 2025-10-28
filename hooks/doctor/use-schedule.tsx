"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface ScheduleFormData {
  doctorId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  maxPatients?: number
  consultationType?: string
  status?: string
  validFrom?: string
  validTo?: string
  breakStartTime?: string
  breakEndTime?: string
  notes?: string
}

export interface Schedule extends ScheduleFormData {
  id: string
  createdAt: string
  updatedAt: string
  doctor?: {
    id: string
    firstName: string
    lastName: string
    specialization: string
    email: string
    primaryDepartment?: {
      id: string
      name: string
    }
  }
}

export interface ScheduleFilters {
  doctorId?: string
  departmentId?: string
  dayOfWeek?: string
  status?: string
}

interface UseScheduleReturn {
  schedules: Schedule[]
  loading: boolean
  error: string | null
  createSchedule: (data: ScheduleFormData) => Promise<Schedule | null>
  updateSchedule: (id: string, data: Partial<ScheduleFormData>) => Promise<Schedule | null>
  deleteSchedule: (id: string) => Promise<boolean>
  fetchSchedules: (filters?: ScheduleFilters) => Promise<void>
  fetchScheduleById: (id: string) => Promise<Schedule | null>
  fetchSchedulesByDoctor: (doctorId: string) => Promise<Schedule[]>
  fetchSchedulesByDepartment: (departmentId: string) => Promise<Schedule[]>
  migrateWorkingHours: (doctorId: string) => Promise<Schedule[]>
}

export const useSchedule = (): UseScheduleReturn => {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const API_BASE_URL = "http://localhost:5000"

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken")
    }
    return null
  }

  const createSchedule = useCallback(
    async (data: ScheduleFormData): Promise<Schedule | null> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/schedules`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to create schedule")
        }

        const newSchedule = await response.json()
        setSchedules(prev => [...prev, newSchedule])

        toast({
          title: "Success",
          description: "Schedule created successfully",
        })

        return newSchedule
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create schedule"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [API_BASE_URL, toast]
  )

  const updateSchedule = useCallback(
    async (id: string, data: Partial<ScheduleFormData>): Promise<Schedule | null> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to update schedule")
        }

        const updatedSchedule = await response.json()
        setSchedules(prev => prev.map(schedule => (schedule.id === id ? updatedSchedule : schedule)))

        toast({
          title: "Success",
          description: "Schedule updated successfully",
        })

        return updatedSchedule
      } catch (err: any) {
        const errorMessage = err.message || "Failed to update schedule"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [API_BASE_URL, toast]
  )

  const deleteSchedule = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
          method: "DELETE",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to delete schedule")
        }

        setSchedules(prev => prev.filter(schedule => schedule.id !== id))

        toast({
          title: "Success",
          description: "Schedule deleted successfully",
        })

        return true
      } catch (err: any) {
        const errorMessage = err.message || "Failed to delete schedule"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [API_BASE_URL, toast]
  )

  const fetchSchedules = useCallback(
    async (filters?: ScheduleFilters): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const params = new URLSearchParams()
        
        if (filters?.doctorId) params.append('doctorId', filters.doctorId)
        if (filters?.departmentId) params.append('departmentId', filters.departmentId)
        if (filters?.dayOfWeek) params.append('dayOfWeek', filters.dayOfWeek)
        if (filters?.status) params.append('status', filters.status)

        const url = `${API_BASE_URL}/schedules${params.toString() ? `?${params.toString()}` : ''}`
        
        const response = await fetch(url, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch schedules")
        }

        const data = await response.json()
        setSchedules(data)
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch schedules"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [API_BASE_URL, toast]
  )

  const fetchScheduleById = useCallback(
    async (id: string): Promise<Schedule | null> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch schedule")
        }

        const schedule = await response.json()
        return schedule
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch schedule"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [API_BASE_URL, toast]
  )

  const fetchSchedulesByDoctor = useCallback(
    async (doctorId: string): Promise<Schedule[]> => {
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/schedules/doctor/${doctorId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctor schedules")
        }

        const schedules = await response.json()
        return schedules
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch doctor schedules"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return []
      }
    },
    [API_BASE_URL, toast]
  )

  const fetchSchedulesByDepartment = useCallback(
    async (departmentId: string): Promise<Schedule[]> => {
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/schedules/department/${departmentId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch department schedules")
        }

        const schedules = await response.json()
        return schedules
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch department schedules"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return []
      }
    },
    [API_BASE_URL, toast]
  )

  const migrateWorkingHours = useCallback(
    async (doctorId: string): Promise<Schedule[]> => {
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/schedules/migrate/${doctorId}`, {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to migrate working hours")
        }

        const schedules = await response.json()
        
        toast({
          title: "Success",
          description: "Working hours migrated to schedules successfully",
        })

        return schedules
      } catch (err: any) {
        const errorMessage = err.message || "Failed to migrate working hours"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return []
      }
    },
    [API_BASE_URL, toast]
  )

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    fetchSchedules,
    fetchScheduleById,
    fetchSchedulesByDoctor,
    fetchSchedulesByDepartment,
    migrateWorkingHours,
  }
}