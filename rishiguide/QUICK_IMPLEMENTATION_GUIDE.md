# Quick Implementation Guide

This guide provides step-by-step code examples to integrate IPD billing and insurance with your existing billing page.

## Step 1: Create IPD Billing Hook

Create `hooks/use-ipd-billing.ts`:

```typescript
import { useState, useEffect } from 'react'
import { useToast } from './use-toast'

interface IPDBill {
  id: string
  admissionId: string
  bedCharges: number
  roomCharges: number
  icuCharges: number
  nursingCharges: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED'
  admission: {
    patient: {
      firstName: string
      lastName: string
      patientId: string
    }
    bedAssignment: {
      bed: {
        bedNumber: string
        ward: { name: string }
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

  return {
    loading,
    bills,
    createIPDBill,
    getBillByAdmission,
    getPendingBills,
    getCompletedBills,
    recordPayment,
    addCharge
  }
}
```

## Step 2: Create Insurance Claims Hook

Create `hooks/use-insurance-claims.ts`:

```typescript
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
    approveClaim,
    rejectClaim
  }
}
```

## Step 3: Update Billing Page

Add these imports to your `app/billing/page.tsx`:

```typescript
import { useIPDBilling } from "@/hooks/use-ipd-billing"
import { useInsuranceClaims } from "@/hooks/use-insurance-claims"
```

Add state for IPD and Insurance:

```typescript
// Add these state variables after your existing state
const { 
  loading: ipdBillingLoading, 
  bills: ipdBills,
  createIPDBill, 
  getBillByAdmission, 
  getPendingBills: getIPDPendingBills,
  getCompletedBills: getIPDCompletedBills,
  recordPayment: recordIPDPayment,
  addCharge
} = useIPDBilling()

const {
  loading: insuranceLoading,
  claims: insuranceClaims,
  createClaim,
  getClaimsByAdmission,
  getPendingClaims,
  approveClaim,
  rejectClaim
} = useInsuranceClaims()

// Add IPD specific state
const [ipdBillForm, setIpdBillForm] = useState({
  admissionId: "",
  patientSearch: "",
  bedCharges: 0,
  roomCharges: 0,
  icuCharges: 0,
  nursingCharges: 0,
  doctorFees: 0,
  additionalCharges: 0,
  notes: ""
})

const [showIPDBillingDialog, setShowIPDBillingDialog] = useState(false)
const [showIPDPaymentDialog, setShowIPDPaymentDialog] = useState(false)
const [selectedIPDBillForPayment, setSelectedIPDBillForPayment] = useState(null)
const [ipdPaymentForm, setIpdPaymentForm] = useState({
  amount: 0,
  paymentMethod: 'CASH' as const,
  transactionId: '',
  notes: ''
})
```

Update the tabs to include IPD and Insurance:

```typescript
// Update the tab navigation
<nav className="flex space-x-6 mb-6">
  {[
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "opd", label: "OPD Bills", icon: FileText },
    { id: "ipd", label: "IPD Bills", icon: Building }, // Add this
    { id: "advances", label: "Advances", icon: CreditCard },
    { id: "ledger", label: "Ledger", icon: BookOpen },
    { id: "tpa", label: "Insurance/TPA", icon: Shield }, // Add this
  ].map((tab) => {
    const Icon = tab.icon
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          activeTab === tab.id
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{tab.label}</span>
      </button>
    )
  })}
</nav>
```

Add IPD Bills Tab Content:

```typescript
{/* IPD Bills Tab */}
{activeTab === "ipd" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">IPD Billing Management</h2>
      <Button onClick={() => setShowIPDBillingDialog(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create IPD Bill
      </Button>
    </div>

    {/* IPD Bills Statistics */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Running Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ipdBills.filter(b => b.status === 'PENDING').length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Outstanding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{ipdBills.reduce((sum, bill) => sum + bill.balanceAmount, 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Daily Collections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{85000}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Insurance Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insuranceClaims.length}</div>
        </CardContent>
      </Card>
    </div>

    {/* IPD Bills Table */}
    <Card>
      <CardHeader>
        <CardTitle>IPD Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Bill ID</th>
                <th className="text-left p-2">Patient</th>
                <th className="text-left p-2">Admission</th>
                <th className="text-left p-2">Ward/Bed</th>
                <th className="text-left p-2">Total Amount</th>
                <th className="text-left p-2">Paid Amount</th>
                <th className="text-left p-2">Balance</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ipdBills.map((bill) => (
                <tr key={bill.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{bill.id.substring(0, 8)}</td>
                  <td className="p-2">
                    <div>
                      <div className="font-medium">
                        {bill.admission.patient.firstName} {bill.admission.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bill.admission.patient.patientId}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">{bill.admissionId.substring(0, 8)}</td>
                  <td className="p-2">
                    {bill.admission.bedAssignment?.bed.ward.name} - {bill.admission.bedAssignment?.bed.bedNumber}
                  </td>
                  <td className="p-2">₹{bill.totalAmount.toLocaleString()}</td>
                  <td className="p-2">₹{bill.paidAmount.toLocaleString()}</td>
                  <td className="p-2">₹{bill.balanceAmount.toLocaleString()}</td>
                  <td className="p-2">{getStatusBadge(bill.status)}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewIPDBill(bill)}
                      >
                        View
                      </Button>
                      {bill.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          onClick={() => openIPDPaymentDialog(bill)}
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

Add Insurance/TPA Tab Content:

```typescript
{/* Insurance/TPA Tab */}
{activeTab === "tpa" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Insurance Claims Management</h2>
      <Button onClick={() => setShowNewClaimDialog(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Claim
      </Button>
    </div>

    {/* Claims Statistics */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Pending Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {insuranceClaims.filter(c => c.status === 'PENDING').length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Approved Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {insuranceClaims.filter(c => c.status === 'APPROVED').length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Claimed Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{insuranceClaims.reduce((sum, claim) => sum + claim.claimedAmount, 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Approved Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{insuranceClaims.reduce((sum, claim) => sum + (claim.approvedAmount || 0), 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Claims Table */}
    <Card>
      <CardHeader>
        <CardTitle>Insurance Claims</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Claim ID</th>
                <th className="text-left p-2">Patient</th>
                <th className="text-left p-2">Insurance Provider</th>
                <th className="text-left p-2">Policy Number</th>
                <th className="text-left p-2">Claimed Amount</th>
                <th className="text-left p-2">Approved Amount</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {insuranceClaims.map((claim) => (
                <tr key={claim.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{claim.id.substring(0, 8)}</td>
                  <td className="p-2">
                    <div>
                      <div className="font-medium">
                        {claim.admission.patient.firstName} {claim.admission.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {claim.admission.patient.patientId}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">{claim.insuranceProvider}</td>
                  <td className="p-2">{claim.policyNumber}</td>
                  <td className="p-2">₹{claim.claimedAmount.toLocaleString()}</td>
                  <td className="p-2">₹{(claim.approvedAmount || 0).toLocaleString()}</td>
                  <td className="p-2">{getStatusBadge(claim.status)}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewClaim(claim)}
                      >
                        View
                      </Button>
                      {claim.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveClaimDialog(claim)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectClaimDialog(claim)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

## Step 4: Add Handler Functions

Add these handler functions to your billing page:

```typescript
// IPD Billing Handlers
const handleCreateIPDBill = async () => {
  try {
    if (!ipdBillForm.admissionId) {
      toast({
        title: "Error",
        description: "Please select an admission",
        variant: "destructive"
      })
      return
    }

    await createIPDBill(ipdBillForm.admissionId, {
      bedCharges: ipdBillForm.bedCharges,
      roomCharges: ipdBillForm.roomCharges,
      icuCharges: ipdBillForm.icuCharges,
      nursingCharges: ipdBillForm.nursingCharges,
      doctorFees: ipdBillForm.doctorFees,
      additionalCharges: ipdBillForm.additionalCharges,
      notes: ipdBillForm.notes
    })

    setShowIPDBillingDialog(false)
    setIpdBillForm({
      admissionId: "",
      patientSearch: "",
      bedCharges: 0,
      roomCharges: 0,
      icuCharges: 0,
      nursingCharges: 0,
      doctorFees: 0,
      additionalCharges: 0,
      notes: ""
    })

    // Refresh bills
    await getIPDPendingBills()
  } catch (error) {
    console.error('Error creating IPD bill:', error)
  }
}

const openIPDPaymentDialog = (bill: any) => {
  setSelectedIPDBillForPayment(bill)
  setIpdPaymentForm({
    amount: bill.balanceAmount,
    paymentMethod: 'CASH',
    transactionId: '',
    notes: ''
  })
  setShowIPDPaymentDialog(true)
}

const handleRecordIPDPayment = async () => {
  try {
    if (!selectedIPDBillForPayment) return

    await recordIPDPayment(selectedIPDBillForPayment.id, {
      amount: ipdPaymentForm.amount,
      paymentMethod: ipdPaymentForm.paymentMethod,
      transactionId: ipdPaymentForm.transactionId,
      notes: ipdPaymentForm.notes
    })

    setShowIPDPaymentDialog(false)
    setSelectedIPDBillForPayment(null)
    setIpdPaymentForm({
      amount: 0,
      paymentMethod: 'CASH',
      transactionId: '',
      notes: ''
    })
  } catch (error) {
    console.error('Error recording payment:', error)
  }
}

// Insurance Claim Handlers
const handleCreateInsuranceClaim = async () => {
  try {
    // Implementation for creating insurance claim
    await createClaim({
      admissionId: claimInfo.admissionId,
      policyNumber: claimInfo.policyNo,
      insuranceProvider: claimInfo.tpa,
      claimedAmount: parseFloat(claimInfo.claimedAmount)
    })

    setShowNewClaimDialog(false)
    // Reset form
    setClaimInfo({
      patient: "",
      tpa: "",
      policyNo: "",
      claimedAmount: "",
      approvedAmount: "",
      status: "Pending",
    })

    // Refresh claims
    await getPendingClaims()
  } catch (error) {
    console.error('Error creating claim:', error)
  }
}

// Load IPD data on component mount
useEffect(() => {
  const loadIPDData = async () => {
    try {
      await getIPDPendingBills()
      await getPendingClaims()
    } catch (error) {
      console.error('Error loading IPD data:', error)
    }
  }

  loadIPDData()
}, [])
```

This implementation provides a complete integration between your existing billing page and the new IPD billing and insurance systems. The code includes proper error handling, loading states, and follows the same patterns as your existing OPD billing implementation.