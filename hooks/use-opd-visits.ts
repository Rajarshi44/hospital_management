import { useState, useCallback } from 'react'
import { useToast } from './use-toast'

export interface OPDVisit {
  id: string
  visitNumber: string
  visitDate: string
  visitTime: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  chiefComplaint?: string
  diagnosis?: string
  prescription?: string
  followUpDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    patientId: string
    name: string
    phone: string
    email?: string
    age: number
    gender: string
    address?: string
    dateOfBirth: string
  }
  doctor: {
    id: string
    doctorId: string
    name: string
    specialization: string
  }
  department: {
    id: string
    name: string
    code: string
  }
  billing?: {
    id: string
    totalAmount: number
    paymentStatus: 'PENDING' | 'COMPLETED' | 'PARTIAL'
    paidAmount: number
    balanceAmount: number
  }
}

export interface VisitFilters {
  search?: string
  date?: string
  department?: string
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  doctorId?: string
  limit?: number
  offset?: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function useOPDVisits() {
  const [loading, setLoading] = useState(false)
  const [visits, setVisits] = useState<OPDVisit[]>([])
  const { toast } = useToast()

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      console.log("🏥 useOPDVisits.getAuthToken() - Token:", token ? "EXISTS" : "NULL")
      return token
    }
    console.log("🏥 useOPDVisits.getAuthToken() - Window undefined, returning null")
    return null
  }

  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token available')
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, [])

  // Get all visits with filters
  const getVisits = useCallback(async (filters?: VisitFilters): Promise<OPDVisit[]> => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters?.search) params.append('search', filters.search)
      if (filters?.date) params.append('date', filters.date)
      if (filters?.department) params.append('department', filters.department)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.doctorId) params.append('doctorId', filters.doctorId)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`${API_BASE_URL}/opd/visits?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setVisits(data)
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch visits'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, toast])

  // Get comprehensive patient data with visits (for billing)
  const getComprehensivePatientData = useCallback(async (filters?: VisitFilters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters?.search) params.append('search', filters.search)
      if (filters?.date) params.append('date', filters.date)
      if (filters?.department) params.append('department', filters.department)
      if (filters?.limit) params.append('limit', filters.limit?.toString() || '50')
      if (filters?.offset) params.append('offset', filters.offset?.toString() || '0')

      const response = await fetch(`${API_BASE_URL}/opd/visits/patients/comprehensive?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch patient data'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, toast])

  // Get today's visits
  const getTodaysVisits = useCallback(async (doctorId?: string): Promise<OPDVisit[]> => {
    try {
      setLoading(true)
      const params = doctorId ? `?doctorId=${doctorId}` : ''
      const response = await fetch(`${API_BASE_URL}/opd/visits/today${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setVisits(data)
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch today\'s visits'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, toast])

  // Get visit by ID
  const getVisitById = useCallback(async (visitId: string): Promise<OPDVisit> => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/opd/visits/${visitId}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch visit'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, toast])

  // Get visits without billing (pending billing)
  const getVisitsWithoutBilling = useCallback(async (filters?: VisitFilters) => {
    try {
      const allVisits = await getVisits(filters)
      // Filter visits that don't have billing or have pending payment status
      return allVisits.filter(visit => 
        !visit.billing || 
        visit.billing.paymentStatus === 'PENDING' || 
        visit.billing.balanceAmount > 0
      )
    } catch (error) {
      throw error
    }
  }, [getVisits])

  return {
    loading,
    visits,
    getVisits,
    getComprehensivePatientData,
    getTodaysVisits,
    getVisitById,
    getVisitsWithoutBilling
  }
}