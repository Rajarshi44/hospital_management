import { useState, useEffect } from 'react'
import { useToast } from './use-toast'

interface IPDBill {
  id: string
  admissionId: string
  billNumber: string
  bedCharges: number
  roomCharges: number
  icuCharges: number
  nursingCharges: number
  doctorFees: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  admission: {
    patient: {
      id: string
      firstName: string
      lastName: string
      patientId: string
    }
    doctor: {
      id: string
      firstName: string
      lastName: string
    }
    bed: {
      id: string
      bedNumber: string
      ward: {
        id: string
        name: string
      }
    }
  }
}

export const useIPDBilling = () => {
  const [loading, setLoading] = useState(false)
  const [bills, setBills] = useState<IPDBill[]>([])
  const { toast } = useToast()

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

  const createIPDBill = async (admissionId: string, billingData: any) => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/ipd/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionId, ...billingData })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create IPD bill')
      }
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "IPD bill created successfully"
      })
      return result
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create IPD bill",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getBillByAdmission = async (admissionId: string) => {
    try {
      const response = await fetch(`${baseUrl}/ipd/billing/admission/${admissionId}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Error fetching bill:', error)
      return null
    }
  }

  const getPendingBills = async () => {
    try {
      const response = await fetch(`${baseUrl}/ipd/billing/pending`)
      if (!response.ok) throw new Error('Failed to fetch pending bills')
      const data = await response.json()
      setBills(data)
      return data
    } catch (error) {
      console.error('Error fetching pending bills:', error)
      return []
    }
  }

  const getCompletedBills = async () => {
    try {
      const response = await fetch(`${baseUrl}/ipd/billing/completed`)
      if (!response.ok) throw new Error('Failed to fetch completed bills')
      return await response.json()
    } catch (error) {
      console.error('Error fetching completed bills:', error)
      return []
    }
  }

  const recordPayment = async (billId: string, paymentData: any) => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/ipd/billing/${billId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to record payment')
      }
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Payment recorded successfully"
      })
      
      // Refresh bills
      await getPendingBills()
      return result
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addCharge = async (billId: string, chargeData: any) => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/ipd/billing/${billId}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chargeData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to add charge')
      }
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Charge added successfully"
      })
      return result
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add charge",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateBill = async (billId: string, updateData: any) => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/ipd/billing/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update bill')
      }
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Bill updated successfully"
      })
      
      // Refresh bills
      await getPendingBills()
      return result
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    bills,
    createIPDBill,
    getBillByAdmission,
    getPendingBills,
    getCompletedBills,
    recordPayment,
    addCharge,
    updateBill
  }
}
