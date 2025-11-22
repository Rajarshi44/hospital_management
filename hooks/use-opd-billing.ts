import { useState, useCallback } from 'react'
import { useToast } from './use-toast'

export interface OPDBilling {
  id: string
  opdVisitId: string
  consultationFee: number
  additionalCharges: number
  discount: number
  tax: number
  totalAmount: number
  paymentStatus: 'PENDING' | 'COMPLETED' | 'PARTIAL'
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'CHEQUE' | 'ONLINE'
  paidAmount: number
  balanceAmount: number
  transactionId?: string
  paymentDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  opdVisit: {
    id: string
    visitId: string
    patientId: string
    doctorId: string
    visitDate: string
    visitTime: string
    status: string
    symptoms?: string
    diagnosis?: string
    prescription?: string
    nextAppointment?: string
    notes?: string
    patient: {
      id: string
      patientId: string
      firstName: string
      lastName: string
      email?: string
      phone: string
      dateOfBirth: string
      gender: string
      address?: string
      emergencyContact?: string
      bloodGroup?: string
      allergies?: string
      medicalHistory?: string
    }
    doctor: {
      id: string
      doctorId: string
      firstName: string
      lastName: string
      email: string
      phone: string
      specialization: string
      qualification: string
      experience: number
      consultationFee: number
      availableFrom: string
      availableTo: string
      departmentId: string
    }
    department?: {
      id: string
      name: string
      description?: string
    }
  }
}

export interface CreateOPDBillingData {
  opdVisitId: string
  consultationFee: number
  additionalCharges?: number
  discount?: number
  tax?: number
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'CHEQUE' | 'ONLINE'
  paidAmount?: number
  transactionId?: string
  notes?: string
}

export interface RecordPaymentData {
  amount: number
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CHEQUE' | 'ONLINE'
  transactionId?: string
  notes?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function useOPDBilling() {
  const [loading, setLoading] = useState(false)
  const [bills, setBills] = useState<OPDBilling[]>([])
  const { toast } = useToast()

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      console.log("💰 useOPDBilling.getAuthToken() - Token:", token ? "EXISTS" : "NULL")
      return token
    }
    console.log("💰 useOPDBilling.getAuthToken() - Window undefined, returning null")
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

  // Create OPD billing
  const createOPDBilling = useCallback(async (data: CreateOPDBillingData): Promise<OPDBilling> => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/opd/billing`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const billing = await response.json()
      toast({
        title: 'Success',
        description: 'OPD billing created successfully'
      })
      return billing
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create billing'
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

  // Get billing by visit ID
  const getBillingByVisitId = useCallback(async (opdVisitId: string): Promise<OPDBilling | null> => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/opd/billing/visit/${opdVisitId}`, {
        headers: getAuthHeaders()
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch billing'
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

  // Get pending payments
  const getPendingPayments = useCallback(async (departmentId?: string, doctorId?: string): Promise<OPDBilling[]> => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (departmentId) params.append('departmentId', departmentId)
      if (doctorId) params.append('doctorId', doctorId)
      
      const response = await fetch(`${API_BASE_URL}/opd/billing/pending?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setBills(data)
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pending payments'
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

  // Get completed payments/bills
  const getCompletedPayments = useCallback(async (departmentId?: string, doctorId?: string): Promise<OPDBilling[]> => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('status', 'COMPLETED')
      if (departmentId) params.append('departmentId', departmentId)
      if (doctorId) params.append('doctorId', doctorId)
      
      const response = await fetch(`${API_BASE_URL}/opd/billing?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch completed payments'
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

  // Record payment
  const recordPayment = useCallback(async (billingId: string, data: RecordPaymentData): Promise<OPDBilling> => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/opd/billing/${billingId}/payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const billing = await response.json()
      toast({
        title: 'Success',
        description: 'Payment recorded successfully'
      })
      return billing
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record payment'
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

  // Get daily collections
  const getDailyCollections = useCallback(async (date?: string) => {
    try {
      setLoading(true)
      const params = date ? `?date=${date}` : ''
      const response = await fetch(`${API_BASE_URL}/opd/billing/collections/daily${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch daily collections'
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

  // Get payment method summary
  const getPaymentMethodSummary = useCallback(async (fromDate?: string, toDate?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (fromDate) params.append('fromDate', fromDate)
      if (toDate) params.append('toDate', toDate)
      
      const response = await fetch(`${API_BASE_URL}/opd/billing/payment-methods/summary?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch payment method summary'
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

  // Update OPD billing
  const updateBill = useCallback(async (billingId: string, updateData: any): Promise<OPDBilling> => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/opd/billing/${billingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const billing = await response.json()
      toast({
        title: 'Success',
        description: 'OPD billing updated successfully'
      })
      
      // Refresh pending bills
      await getPendingPayments()
      return billing
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update billing'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, toast, getPendingPayments])

  return {
    loading,
    bills,
    createOPDBilling,
    getBillingByVisitId,
    getPendingPayments,
    getCompletedPayments,
    recordPayment,
    getDailyCollections,
    getPaymentMethodSummary,
    updateBill
  }
}