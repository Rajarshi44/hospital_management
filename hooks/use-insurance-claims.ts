import { useState } from 'react'
import { useToast } from './use-toast'

interface InsuranceClaim {
  id: string
  admissionId: string
  policyNumber: string
  insuranceProvider: string
  tpaName?: string
  claimedAmount: number
  approvedAmount?: number
  status: 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  admission: {
    patient: {
      firstName: string
      lastName: string
      patientId: string
    }
  }
}

export const useInsuranceClaims = () => {
  const [loading, setLoading] = useState(false)
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const { toast } = useToast()

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

  const createClaim = async (claimData: any) => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/ipd/insurance/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create insurance claim')
      }
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Insurance claim created successfully"
      })
      return result
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create insurance claim",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getClaimsByAdmission = async (admissionId: string) => {
    try {
      const response = await fetch(`${baseUrl}/ipd/insurance/claims/admission/${admissionId}`)
      if (!response.ok) return []
      return await response.json()
    } catch (error) {
      console.error('Error fetching claims:', error)
      return []
    }
  }

  const getPendingClaims = async () => {
    try {
      const response = await fetch(`${baseUrl}/ipd/insurance/claims/pending`)
      if (!response.ok) throw new Error('Failed to fetch pending claims')
      const data = await response.json()
      setClaims(data)
      return data
    } catch (error) {
      console.error('Error fetching pending claims:', error)
      return []
    }
  }

  const getApprovedClaims = async () => {
    try {
      const response = await fetch(`${baseUrl}/ipd/insurance/claims/approved`)
      if (!response.ok) throw new Error('Failed to fetch approved claims')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching approved claims:', error)
      return []
    }
  }

  const searchClaims = async (searchQuery: string, status?: string) => {
    try {
      let url = `${baseUrl}/ipd/insurance/claims`
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to search claims')
      const data = await response.json()
      
      // Filter by patient name if search query provided
      if (searchQuery.trim()) {
        const filtered = data.filter((claim: any) => {
          const patientName = `${claim.admission?.patient?.firstName || ''} ${claim.admission?.patient?.lastName || ''}`.toLowerCase()
          const patientId = claim.admission?.patient?.patientId?.toLowerCase() || ''
          const insuranceProvider = claim.insuranceProvider?.toLowerCase() || ''
          const policyNumber = claim.policyNumber?.toLowerCase() || ''
          const search = searchQuery.toLowerCase()
          
          return patientName.includes(search) || 
                 patientId.includes(search) || 
                 insuranceProvider.includes(search) || 
                 policyNumber.includes(search)
        })
        return filtered
      }
      
      return data
    } catch (error) {
      console.error('Error searching claims:', error)
      return []
    }
  }

  const approveClaim = async (claimId: string, approvalData: any) => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/ipd/insurance/claims/${claimId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to approve claim')
      }
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Claim approved successfully"
      })
      
      // Refresh claims
      await getPendingClaims()
      return result
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve claim",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const rejectClaim = async (claimId: string, rejectionData: any) => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/ipd/insurance/claims/${claimId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rejectionData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to reject claim')
      }
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Claim rejected"
      })
      
      // Refresh claims
      await getPendingClaims()
      return result
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject claim",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    claims,
    createClaim,
    getClaimsByAdmission,
    getPendingClaims,
    getApprovedClaims,
    searchClaims,
    approveClaim,
    rejectClaim
  }
}
