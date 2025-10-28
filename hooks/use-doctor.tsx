"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface DoctorFormData {
  // Personal Information
  firstName: string
  lastName: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  dateOfBirth?: string
  phone: string
  email: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  bloodGroup?: string

  // Professional Information
  specialization: string
  qualification: string
  licenseNumber: string
  experience: number
  consultationFee: number
  department?: string
  joiningDate?: string

  // Availability & Schedule (individual fields)
  workingDays?: string[]
  opdStartTime?: string
  opdEndTime?: string
  consultationType?: string
  maxPatientsPerDay?: number

  // Additional Fields
  isAvailable?: boolean
  isActive?: boolean
  avatar?: string
  workingHours?: string
  notes?: string
}

export interface Doctor extends DoctorFormData {
  id: string
  doctorId: string
  createdAt: string
  updatedAt: string
  departmentId?: string
  primaryDepartment?: {
    id: string
    name: string
    description?: string
  }
}

interface UseDoctorReturn {
  doctors: Doctor[]
  loading: boolean
  error: string | null
  createDoctor: (data: DoctorFormData) => Promise<Doctor | null>
  updateDoctor: (id: string, data: Partial<DoctorFormData>) => Promise<Doctor | null>
  fetchDoctors: () => Promise<void>
  fetchDoctorById: (id: string) => Promise<Doctor | null>
  getDoctorsByDepartment: (departmentId: string) => Promise<Doctor[]>
  getWorkingHours: (doctorId: string) => Promise<any>
  deleteDoctor: (id: string) => Promise<boolean>
}

export const useDoctor = (): UseDoctorReturn => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken")
    }
    return null
  }

  const createDoctor = useCallback(
    async (data: DoctorFormData): Promise<Doctor | null> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        console.log("Auth token:", token ? "Present" : "Missing")
        console.log("API URL:", `${API_BASE_URL}/doctors`)
        
        const response = await fetch(`${API_BASE_URL}/doctors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        })

        console.log("Response status:", response.status)
        console.log("Response headers:", response.headers)

        if (!response.ok) {
          const errorData = await response.json()
          console.log("Error response:", errorData)
          throw new Error(errorData.message || "Failed to create doctor")
        }

        const newDoctor = await response.json()
        setDoctors(prev => [...prev, newDoctor])

        toast({
          title: "Success",
          description: "Doctor registered successfully",
        })

        return newDoctor
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create doctor"
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

  const updateDoctor = useCallback(
    async (id: string, data: Partial<DoctorFormData>): Promise<Doctor | null> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to update doctor")
        }

        const updatedDoctor = await response.json()
        setDoctors(prev => prev.map(doc => (doc.id === id ? updatedDoctor : doc)))

        toast({
          title: "Success",
          description: "Doctor updated successfully",
        })

        return updatedDoctor
      } catch (err: any) {
        const errorMessage = err.message || "Failed to update doctor"
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

  const fetchDoctors = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch doctors")
      }

      const data = await response.json()
      setDoctors(data)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch doctors"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL, toast])

  const fetchDoctorById = useCallback(
    async (id: string): Promise<Doctor | null> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctor")
        }

        const doctor = await response.json()
        return doctor
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch doctor"
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

  const getDoctorsByDepartment = useCallback(
    async (departmentId: string): Promise<Doctor[]> => {
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/doctors?departmentId=${departmentId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctors by department")
        }

        const doctors = await response.json()
        return doctors
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch doctors by department"
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

  const getWorkingHours = useCallback(
    async (doctorId: string): Promise<any> => {
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctor working hours")
        }

        const doctor = await response.json()
        
        // Parse the workingHours JSON string
        let workingHours = {}
        if (doctor.workingHours) {
          try {
            workingHours = JSON.parse(doctor.workingHours)
          } catch (parseError) {
            console.error('Error parsing working hours JSON:', parseError)
            workingHours = {}
          }
        }

        return {
          doctor: doctor,
          workingHours: workingHours
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch doctor working hours"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return { doctor: null, workingHours: {} }
      }
    },
    [API_BASE_URL, toast]
  )

  const deleteDoctor = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
          method: "DELETE",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          throw new Error("Failed to delete doctor")
        }

        setDoctors(prev => prev.filter(doc => doc.id !== id))

        toast({
          title: "Success",
          description: "Doctor deleted successfully",
        })

        return true
      } catch (err: any) {
        const errorMessage = err.message || "Failed to delete doctor"
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

  return {
    doctors,
    loading,
    error,
    createDoctor,
    updateDoctor,
    fetchDoctors,
    fetchDoctorById,
    getDoctorsByDepartment,
    getWorkingHours,
    deleteDoctor,
  }
}
