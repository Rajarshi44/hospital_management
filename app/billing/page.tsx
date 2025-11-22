"use client"






import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useOPDBilling } from "@/hooks/use-opd-billing"
import { useOPDVisits } from "@/hooks/use-opd-visits"
import { useIPDBilling } from "@/hooks/use-ipd-billing"
import { useInsuranceClaims } from "@/hooks/use-insurance-claims"
import { IPDService } from "@/lib/ipd-service"
import type { CreateOPDBillingData } from "@/hooks/use-opd-billing"
import {
  Search,
  Plus,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Receipt,
  PieChart,
  CreditCard,
  Users,
  Activity,
  Bed,
  TestTube,
  Pill,
  Shield,
  RefreshCw,
  Download,
  Printer,
  X,
  IndianRupee,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  MoreVertical,
  Edit,
  Eye,
  Upload,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { BillPrintLayout } from "@/components/billing/bill-print"

// Mock data for demonstration
const mockDashboardStats = {
  todayCollections: 125000,
  outstandingReceivables: 450000,
  pendingTPAClaims: 18,
  openInterimBills: 12,
}

const mockRevenueBySource = [
  { source: "OPD", amount: 85000, percentage: 34, color: "bg-blue-500" },
  { source: "IPD", amount: 120000, percentage: 48, color: "bg-green-500" },
  { source: "Pharmacy", amount: 25000, percentage: 10, color: "bg-purple-500" },
  { source: "Lab", amount: 15000, percentage: 6, color: "bg-orange-500" },
  { source: "OT", amount: 5000, percentage: 2, color: "bg-red-500" },
]

const mockOPDBills = [
  {
    id: "OPD001",
    patientUhid: "PAT001",
    patientName: "John Doe",
    doctor: "Dr. Sarah Johnson",
    amount: 2500,
    status: "Paid",
    date: "2025-10-28",
  },
  {
    id: "OPD002",
    patientUhid: "PAT002",
    patientName: "Jane Smith",
    doctor: "Dr. Michael Chen",
    amount: 1800,
    status: "Pending",
    date: "2025-10-28",
  },
  {
    id: "OPD003",
    patientUhid: "PAT003",
    patientName: "Bob Wilson",
    doctor: "Dr. Emily Brown",
    amount: 3200,
    status: "Interim",
    date: "2025-10-27",
  },
]

const mockIPDBills = [
  {
    id: "IPD001",
    admissionId: "ADM001",
    patientName: "Alice Johnson",
    bedDays: 5,
    runningTotal: 45000,
    tpaStatus: "Approved",
    status: "Running",
  },
  {
    id: "IPD002",
    admissionId: "ADM002",
    patientName: "Robert Smith",
    bedDays: 3,
    runningTotal: 28000,
    tpaStatus: "Pending",
    status: "Running",
  },
  {
    id: "IPD003",
    admissionId: "ADM003",
    patientName: "Carol White",
    bedDays: 7,
    runningTotal: 65000,
    tpaStatus: "N/A",
    status: "Finalized",
  },
]

const mockTPAClaims = [
  {
    claimId: "CLM001",
    patient: "Alice Johnson",
    tpa: "Star Health",
    policyNo: "SH123456",
    claimedAmount: 45000,
    approvedAmount: 40000,
    status: "Approved",
  },
  {
    claimId: "CLM002",
    patient: "Robert Smith",
    tpa: "HDFC Ergo",
    policyNo: "HD789012",
    claimedAmount: 28000,
    approvedAmount: 0,
    status: "Pending",
  },
  {
    claimId: "CLM003",
    patient: "David Brown",
    tpa: "ICICI Lombard",
    policyNo: "IC345678",
    claimedAmount: 55000,
    approvedAmount: 0,
    status: "Rejected",
  },
]

const mockAdvancePayments = [
  {
    id: "ADV001",
    patientUhid: "PAT001",
    patientName: "John Doe",
    amount: 10000,
    mode: "Card",
    date: "2025-10-25",
    status: "Applied",
  },
  {
    id: "ADV002",
    patientUhid: "PAT004",
    patientName: "Emma Wilson",
    amount: 5000,
    mode: "Cash",
    date: "2025-10-27",
    status: "Pending",
  },
]

const mockLedgerTransactions = [
  {
    txnId: "TXN001",
    date: "2025-10-28 10:30",
    type: "Payment",
    patientUhid: "PAT001",
    amount: 2500,
    mode: "UPI",
    status: "Success",
    billId: "OPD001",
  },
  {
    txnId: "TXN002",
    date: "2025-10-28 11:15",
    type: "Refund",
    patientUhid: "PAT005",
    amount: 500,
    mode: "Cash",
    status: "Completed",
    billId: "OPD015",
  },
  {
    txnId: "TXN003",
    date: "2025-10-28 14:20",
    type: "Advance",
    patientUhid: "PAT004",
    amount: 5000,
    mode: "Cash",
    status: "Success",
    billId: "-",
  },
]

interface BillingLineItem {
  id: string
  description: string
  type: string
  rate: number
  discount: number
  amount: number
}

interface BillingCategory {
  id: string
  name: string
  items: BillingLineItem[]
}

export default function BillingPage() {
  const { toast } = useToast()
  const { 
    loading: opdBillingLoading, 
    createOPDBilling, 
    getBillingByVisitId, 
    getPendingPayments,
    getCompletedPayments,
    recordPayment,
    bills: existingBills
  } = useOPDBilling()
  
  const {
    loading: visitsLoading,
    visits: opdVisits,
    getVisits,
    getVisitsWithoutBilling,
    getComprehensivePatientData,
    getTodaysVisits
  } = useOPDVisits()
  
  const { 
    loading: ipdBillingLoading, 
    bills: ipdBills,
    createIPDBill, 
    getBillByAdmission, 
    getPendingBills: getIPDPendingBills,
    getCompletedBills: getIPDCompletedBills,
    recordPayment: recordIPDPayment,
    addCharge,
    updateBill: updateIPDBill
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
  
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [showOPDDialog, setShowOPDDialog] = useState(false)
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showNewClaimDialog, setShowNewClaimDialog] = useState(false)
  const [showViewClaimDialog, setShowViewClaimDialog] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [showViewIPDBillDialog, setShowViewIPDBillDialog] = useState(false)
  const [selectedIPDBill, setSelectedIPDBill] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [dateFilter, setDateFilter] = useState("today")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [paymentModeFilter, setPaymentModeFilter] = useState("all")

  // IPD Billing State
  const [ipdBillForm, setIpdBillForm] = useState({
    admissionId: "",
    patientSearch: "",
    bedCharges: 0,
    roomCharges: 0,
    icuCharges: 0,
    nursingCharges: 0,
    doctorFees: 0,
    additionalCharges: 0,
    notes: "",
    additionalChargesList: [{ heading: "", amount: 0 }] as Array<{ heading: string; amount: number }>
  })
  
  const [showIPDBillingDialog, setShowIPDBillingDialog] = useState(false)
  const [showIPDPaymentDialog, setShowIPDPaymentDialog] = useState(false)
  const [selectedIPDBillForPayment, setSelectedIPDBillForPayment] = useState<any>(null)
  const [ipdPaymentForm, setIpdPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'UPI' | 'CHEQUE' | 'ONLINE',
    transactionId: '',
    notes: ''
  })

  // IPD admission search state (moved to component level)
  const [ipdSearchResults, setIpdSearchResults] = useState<any[]>([])
  const [showIpdSearchResults, setShowIpdSearchResults] = useState(false)
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null)
  const ipdSearchTimer = useRef<number | null>(null)

  // Edit bill state
  const [editBillForm, setEditBillForm] = useState({
    bedCharges: 0,
    roomCharges: 0,
    icuCharges: 0,
    nursingCharges: 0,
    doctorFees: 0,
    additionalCharges: 0,
    additionalChargesList: [] as Array<{ heading: string; amount: number }>,
    notes: ""
  })

  // Billing categories state
  const [billingCategories, setBillingCategories] = useState<BillingCategory[]>([
    {
      id: "bed",
      name: "BED CHARGES",
      items: [
        {
          id: "bed-1",
          description: "",
          type: "days",
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ],
    },
    {
      id: "ot-rent",
      name: "OT RENT",
      items: [
        {
          id: "ot-1",
          description: "",
          type: "unit",
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ],
    },
    {
      id: "general",
      name: "GENERAL CHARGES",
      items: [
        {
          id: "gen-1",
          description: "",
          type: "day",
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ],
    },
    {
      id: "ot-items",
      name: "O.T ITEMS",
      items: [
        {
          id: "ot-item-1",
          description: "",
          type: "unit",
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ],
    },
    {
      id: "doctor",
      name: "DOCTOR CHARGES",
      items: [
        {
          id: "doc-1",
          description: "",
          type: "surgery",
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ],
    },
    {
      id: "other",
      name: "OTHER CHARGES",
      items: [
        {
          id: "other-1",
          description: "",
          type: "lumpsum",
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ],
    },
  ])
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showPrintPreview, setShowPrintPreview] = useState(false)

  // Patient and visit info state
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    uhid: "",
    age: "",
    gender: "",
    pan: "",
    cin: "",
    address: "",
  })

  const [visitInfo, setVisitInfo] = useState({
    admissionDate: "",
    dischargeDate: "",
    doctor: "",
    diagnosis: "",
  })

  // OPD Billing form state
  const [opdBillingForm, setOpdBillingForm] = useState({
    opdVisitId: "",
    patientSearch: "",
    consultationFee: 0,
    additionalCharges: 0,
    discount: 0,
    tax: 0,
    paymentMethod: "CASH" as const,
    paidAmount: 0,
    transactionId: "",
    notes: "",
    additionalChargesList: [{ heading: "", amount: 0 }] as Array<{ heading: string; amount: number }>
  })

  // Edit OPD Bill state
  const [editOPDBillForm, setEditOPDBillForm] = useState({
    consultationFee: 0,
    additionalCharges: 0,
    discount: 0,
    tax: 0,
    additionalChargesList: [] as Array<{ heading: string; amount: number }>,
    notes: ""
  })
  const [showViewOPDBillDialog, setShowViewOPDBillDialog] = useState(false)
  const [selectedOPDBill, setSelectedOPDBill] = useState<any>(null)
  const [isOPDEditMode, setIsOPDEditMode] = useState(false)

  // Real data state
  const [pendingVisits, setPendingVisits] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedVisit, setSelectedVisit] = useState<any>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [completedBills, setCompletedBills] = useState<any[]>([])
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<any>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'UPI' | 'CHEQUE' | 'ONLINE',
    transactionId: '',
    notes: ''
  })

  // IPD Patient Search State
  const [ipdSearchLoading, setIpdSearchLoading] = useState(false)

  // Load pending bills and visits on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load pending payments (this will show existing bills)
        await getPendingPayments()
        
        // Load completed bills for printing
        await loadCompletedBills()
        
        // Load visits without billing or with incomplete payments
        const visitsWithoutBilling = await getVisitsWithoutBilling()
        
        // Filter out visits that already have completed billing
        const filteredVisits = []
        for (const visit of visitsWithoutBilling) {
          const existingBilling = await checkBillingExists(visit.id)
          if (!existingBilling || existingBilling.paymentStatus !== 'COMPLETED') {
            filteredVisits.push(visit)
          }
        }
        
        setPendingVisits(filteredVisits)
        
        // Load IPD data
        await getIPDPendingBills()
        await getPendingClaims()
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadInitialData()
  }, [])

  // Debounced IPD patient search
  useEffect(() => {
    const searchQuery = ipdBillForm.patientSearch.trim()
    if (!searchQuery) {
      setIpdSearchResults([])
      setShowIpdSearchResults(false)
      return
    }

    const debounceTimer = setTimeout(async () => {
      await handleIpdPatientSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [ipdBillForm.patientSearch])

  // Search for patients/visits
  const handlePatientSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      // First try comprehensive search
      let response = await getComprehensivePatientData({
        search: searchQuery,
        limit: 10
      })
      
      // Handle the response structure from backend
      let results = response?.data || response || []
      
      // If no results from comprehensive search, try regular visits search
      if (results.length === 0) {
        console.log('No results from comprehensive search, trying regular visits...')
        const visitResults = await getVisits({
          limit: 20
        })
        
        // Filter visits that match the search query
        results = visitResults.filter(visit => {
          const patientName = (visit.patient?.name || '').toLowerCase()
          const patientId = (visit.patient?.patientId || '').toLowerCase()
          const visitNumber = (visit.visitNumber || '').toLowerCase()
          const searchLower = searchQuery.toLowerCase()
          
          return patientName.includes(searchLower) || 
                 patientId.includes(searchLower) || 
                 visitNumber.includes(searchLower)
        })
      }
      
      console.log('Search results:', results)
      setSearchResults(results)
      setShowSearchResults(true)
      
      // If still no results, show a message
      if (results.length === 0) {
        toast({
          title: "No Results Found",
          description: `No patients or visits found for "${searchQuery}". Try searching by patient name, UHID, or visit number.`,
          variant: "destructive"
        })
      }
      
    } catch (error) {
      console.error('Error searching patients:', error)
      toast({
        title: "Search Error",
        description: "Failed to search patients. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Search for IPD patients/admissions
  const handleIpdPatientSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setIpdSearchResults([])
      setShowIpdSearchResults(false)
      return
    }

    try {
      setIpdSearchLoading(true)
      
      // Search active admissions
      const admissionsResponse = await IPDService.getAdmissions({
        status: 'ACTIVE',
        limit: 20
      }) as any
      
      const admissions = admissionsResponse.data || admissionsResponse || []
      
      // Filter admissions based on search query
      const filteredResults = admissions.filter((admission: any) => {
        const patient = admission?.patient
        if (!patient) return false
        
        const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase()
        const searchLower = searchQuery.toLowerCase()
        
        return (
          patientName.includes(searchLower) ||
          patient.patientId?.toLowerCase().includes(searchLower) ||
          patient.phone?.includes(searchQuery) ||
          admission.admissionId?.toLowerCase().includes(searchLower)
        )
      })
      
      setIpdSearchResults(filteredResults.slice(0, 10)) // Limit to 10 results
      setShowIpdSearchResults(filteredResults.length > 0)
      
    } catch (error) {
      console.error('Error searching IPD patients:', error)
      toast({
        title: "Error",
        description: "Failed to search for patients",
        variant: "destructive",
      })
    } finally {
      setIpdSearchLoading(false)
    }
  }

  // Check if billing exists for a visit
  const checkBillingExists = async (visitId: string) => {
    try {
      const existingBilling = await getBillingByVisitId(visitId)
      return existingBilling
    } catch (error) {
      return null
    }
  }

  // Select a visit for billing
  const handleVisitSelect = async (result: any) => {
    // Handle both comprehensive data structure and regular visit structure
    const patient = result.patient || result
    const visit = result.visit || result
    const billing = result.billing || visit.billing
    
    const visitId = visit.id || result.id
    
    // Check if billing already exists
    const existingBilling = await checkBillingExists(visitId)
    
    if (existingBilling && existingBilling.paymentStatus === 'COMPLETED') {
      toast({
        title: "Billing Already Completed",
        description: `This visit already has completed billing. Bill ID: ${existingBilling.id}`,
        variant: "destructive"
      })
      return
    }

    if (existingBilling && existingBilling.paymentStatus !== 'COMPLETED') {
      toast({
        title: "Billing Exists",
        description: `Billing exists but payment is ${existingBilling.paymentStatus}. Balance: ₹${existingBilling.balanceAmount}`,
        variant: "destructive"
      })
      return
    }

    // Transform the data to match expected format
    const selectedVisitData = {
      id: visitId,
      visitNumber: visit.visitId || visit.visitNumber,
      visitDate: visit.visitDate,
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        name: patient.fullName || patient.name || `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        address: patient.address
      },
      doctor: {
        id: result.doctor?.id || visit.doctor?.id,
        name: result.doctor?.name || visit.doctor?.name || `${result.doctor?.firstName} ${result.doctor?.lastName}`,
        specialization: result.doctor?.specialization || visit.doctor?.specialization
      },
      department: {
        id: result.department?.id || visit.department?.id,
        name: result.department?.name || visit.department?.name
      },
      billing: billing
    }

    setSelectedVisit(selectedVisitData)
    setOpdBillingForm({
      ...opdBillingForm,
      opdVisitId: visitId,
      patientSearch: `${selectedVisitData.patient.name} (${selectedVisitData.patient.patientId}) - Visit: ${selectedVisitData.visitNumber}`
    })
    setShowSearchResults(false)
  }

  // Clear selection
  const clearVisitSelection = () => {
    setSelectedVisit(null)
    setOpdBillingForm({
      ...opdBillingForm,
      opdVisitId: "",
      patientSearch: ""
    })
  }

  // Select an admission for IPD billing
  const handleAdmissionSelect = (admission: any) => {
    setSelectedAdmission(admission)
    setIpdBillForm({
      ...ipdBillForm,
      admissionId: admission.id,
      patientSearch: `${admission.patient?.firstName || ''} ${admission.patient?.lastName || ''} (${admission.patient?.patientId || 'N/A'}) - Admission: ${admission.admissionId || 'N/A'}`
    })
    setShowIpdSearchResults(false)
  }

  // Clear IPD admission selection
  const clearAdmissionSelection = () => {
    setSelectedAdmission(null)
    setIpdBillForm({
      ...ipdBillForm,
      admissionId: "",
      patientSearch: ""
    })
  }

  // Claim form state
  const [claimInfo, setClaimInfo] = useState({
    patient: "",
    tpa: "",
    policyNo: "",
    claimedAmount: "",
    approvedAmount: "",
    status: "Pending",
  })

  // Print ref
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const originalContent = document.body.innerHTML

      // Replace body content with print content
      document.body.innerHTML = printContent

      // Print
      window.print()

      // Restore original content
      document.body.innerHTML = originalContent

      // Reload to restore React state
      window.location.reload()
    }
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: BillingCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.toUpperCase(),
      items: [
        {
          id: `item-${Date.now()}`,
          description: "",
          type: "unit",
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ],
    }

    setBillingCategories([...billingCategories, newCategory])
    setNewCategoryName("")
    setShowAddCategoryDialog(false)

    toast({
      title: "Category Added",
      description: `${newCategoryName} category has been added`,
    })
  }

  const removeCategory = (categoryId: string) => {
    setBillingCategories(billingCategories.filter(cat => cat.id !== categoryId))
    toast({
      title: "Category Removed",
      description: "Category has been removed",
    })
  }

  const addLineItem = (categoryId: string) => {
    setBillingCategories(
      billingCategories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: [
              ...category.items,
              {
                id: `item-${Date.now()}`,
                description: "",
                type: "unit",
                rate: 0,
                discount: 0,
                amount: 0,
              },
            ],
          }
        }
        return category
      })
    )
  }

  const removeLineItem = (categoryId: string, itemId: string) => {
    setBillingCategories(
      billingCategories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.filter(item => item.id !== itemId),
          }
        }
        return category
      })
    )
  }

  const updateLineItem = (categoryId: string, itemId: string, field: keyof BillingLineItem, value: any) => {
    setBillingCategories(
      billingCategories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.map(item => {
              if (item.id === itemId) {
                const updatedItem = { ...item, [field]: value }
                // Auto-calculate amount
                if (field === "rate" || field === "discount") {
                  updatedItem.amount = updatedItem.rate - updatedItem.discount
                }
                return updatedItem
              }
              return item
            }),
          }
        }
        return category
      })
    )
  }

  const calculateTotal = () => {
    return billingCategories.reduce(
      (total, category) => total + category.items.reduce((catTotal, item) => catTotal + item.amount, 0),
      0
    )
  }

  const calculateTotalDiscount = () => {
    return billingCategories.reduce(
      (total, category) => total + category.items.reduce((catTotal, item) => catTotal + item.discount, 0),
      0
    )
  }

  const total = calculateTotal()
  const totalDiscount = calculateTotalDiscount()
  const subtotal = total
  const serviceCharge = subtotal * 0.15
  const billAmount = subtotal + serviceCharge

  const handleCreateOPDBill = async () => {
    try {
      if (!opdBillingForm.opdVisitId) {
        toast({
          title: "Error",
          description: "Please search and select a valid OPD visit",
          variant: "destructive"
        })
        return
      }

      if (opdBillingForm.consultationFee <= 0) {
        toast({
          title: "Error", 
          description: "Consultation fee must be greater than 0",
          variant: "destructive"
        })
        return
      }

      // Double check if billing already exists
      const existingBilling = await checkBillingExists(opdBillingForm.opdVisitId)
      if (existingBilling) {
        toast({
          title: "Error",
          description: "Billing already exists for this visit. Please select a different visit.",
          variant: "destructive"
        })
        return
      }

      const billingData: CreateOPDBillingData = {
        opdVisitId: opdBillingForm.opdVisitId,
        consultationFee: opdBillingForm.consultationFee,
        additionalCharges: opdBillingForm.additionalCharges || 0,
        discount: opdBillingForm.discount || 0,
        tax: opdBillingForm.tax || 0,
        paymentMethod: opdBillingForm.paymentMethod,
        paidAmount: opdBillingForm.paidAmount || 0,
        transactionId: opdBillingForm.transactionId || undefined,
        notes: opdBillingForm.notes || undefined,
      }

      const createdBilling = await createOPDBilling(billingData)
      
      // Reset form
      setOpdBillingForm({
        opdVisitId: "",
        patientSearch: "",
        consultationFee: 0,
        additionalCharges: 0,
        discount: 0,
        tax: 0,
        paymentMethod: "CASH",
        paidAmount: 0,
        transactionId: "",
        notes: "",
        additionalChargesList: [{ heading: "", amount: 0 }]
      })
      
      // Clear selected visit
      setSelectedVisit(null)
      setShowSearchResults(false)

      // Refresh data
      await getPendingPayments()
      const visitsWithoutBilling = await getVisitsWithoutBilling()
      setPendingVisits(visitsWithoutBilling)

      toast({
        title: "Success",
        description: `OPD Bill created successfully. Bill ID: ${createdBilling.id}`,
      })
      
      // Close dialog
      setShowOPDDialog(false)
    } catch (error) {
      console.error('Error creating OPD bill:', error)
      
      // Handle specific billing already exists error
      if (error instanceof Error && error.message.includes("Billing already exists")) {
        toast({
          title: "Billing Already Exists",
          description: "This OPD visit already has billing. Please select a different visit.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create billing",
          variant: "destructive"
        })
      }
    }
  }

  const handlePrintBill = () => {
    setShowPrintPreview(true)
    setTimeout(() => {
      handlePrint()
    }, 100)
    toast({
      title: "Printing Bill",
      description: "Opening print dialog...",
    })
  }

  const handleRecordAdvance = () => {
    toast({
      title: "Advance Payment Recorded",
      description: "Advance payment has been recorded successfully",
    })
    setShowAdvanceDialog(false)
  }

  const handleInitiateRefund = () => {
    toast({
      title: "Refund Initiated",
      description: "Refund request has been submitted for approval",
    })
    setShowRefundDialog(false)
  }

  // Load completed bills
  const loadCompletedBills = async () => {
    try {
      const completed = await getCompletedPayments()
      setCompletedBills(completed)
    } catch (error) {
      console.error('Error loading completed bills:', error)
    }
  }

  // Handle payment recording
  const handleRecordPayment = async () => {
    try {
      if (!selectedBillForPayment) return

      if (paymentForm.amount <= 0) {
        toast({
          title: "Error",
          description: "Payment amount must be greater than 0",
          variant: "destructive"
        })
        return
      }

      if (paymentForm.amount > selectedBillForPayment.balanceAmount) {
        toast({
          title: "Error",
          description: "Payment amount cannot exceed balance amount",
          variant: "destructive"
        })
        return
      }

      await recordPayment(selectedBillForPayment.id, {
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId,
        notes: paymentForm.notes
      })

      // Refresh bills data
      await getPendingPayments()
      await loadCompletedBills()

      // Reset form and close dialog
      setPaymentForm({
        amount: 0,
        paymentMethod: 'CASH',
        transactionId: '',
        notes: ''
      })
      setSelectedBillForPayment(null)
      setShowPaymentDialog(false)

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
    } catch (error) {
      console.error('Error recording payment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record payment",
        variant: "destructive"
      })
    }
  }

  // Open payment dialog
  const openPaymentDialog = (bill: any) => {
    setSelectedBillForPayment(bill)
    setPaymentForm({
      amount: bill.balanceAmount,
      paymentMethod: 'CASH',
      transactionId: '',
      notes: ''
    })
    setShowPaymentDialog(true)
  }

  // Print completed bill
  const printCompletedBill = (bill: any) => {
    // Set up the print data similar to current bill printing
    setPatientInfo({
      name: bill.opdVisit.patient.firstName + ' ' + bill.opdVisit.patient.lastName,
      uhid: bill.opdVisit.patient.patientId,
      age: calculateAge(bill.opdVisit.patient.dateOfBirth).toString(),
      gender: bill.opdVisit.patient.gender,
      pan: "",
      cin: "",
      address: bill.opdVisit.patient.address || ""
    })

    setVisitInfo({
      admissionDate: new Date(bill.opdVisit.visitDate).toLocaleDateString(),
      dischargeDate: "",
      doctor: bill.opdVisit.doctor.firstName + ' ' + bill.opdVisit.doctor.lastName,
      diagnosis: bill.opdVisit.diagnosis || "General Consultation"
    })

    // Set billing categories for print
    const printCategories = [{
      id: "consultation",
      name: "CONSULTATION",
      items: [{
        id: "consultation-fee",
        description: "Consultation Fee",
        type: "unit" as const,
        rate: bill.consultationFee,
        discount: bill.discount,
        amount: bill.consultationFee - bill.discount
      }]
    }]

    if (bill.additionalCharges > 0) {
      printCategories.push({
        id: "additional",
        name: "ADDITIONAL CHARGES",
        items: [{
          id: "additional-charges",
          description: "Additional Charges",
          type: "unit" as const,
          rate: bill.additionalCharges,
          discount: 0,
          amount: bill.additionalCharges
        }]
      })
    }

    setBillingCategories(printCategories)
    setShowPrintPreview(true)
    
    setTimeout(() => {
      handlePrint()
    }, 100)
  }

  // Calculate age helper
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleCreateClaim = () => {
    toast({
      title: "Claim Created",
      description: "Insurance claim has been created successfully",
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
  }

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

      // Calculate total additional charges from the list
      const totalAdditionalCharges = ipdBillForm.additionalChargesList.reduce(
        (sum, charge) => sum + (charge.amount || 0), 
        0
      )

      await createIPDBill(ipdBillForm.admissionId, {
        bedCharges: ipdBillForm.bedCharges,
        roomCharges: ipdBillForm.roomCharges,
        icuCharges: ipdBillForm.icuCharges,
        nursingCharges: ipdBillForm.nursingCharges,
        doctorFees: ipdBillForm.doctorFees,
        additionalCharges: ipdBillForm.additionalCharges + totalAdditionalCharges,
        notes: ipdBillForm.notes,
        additionalChargesList: JSON.stringify(ipdBillForm.additionalChargesList.filter(c => c.heading && c.amount > 0))
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
        notes: "",
        additionalChargesList: [{ heading: "", amount: 0 }]
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

  const handleViewIPDBill = (bill: any) => {
    setSelectedIPDBill(bill)
    setIsEditMode(false)
    setShowViewIPDBillDialog(true)
  }

  const handleEditIPDBill = (bill: any) => {
    setSelectedIPDBill(bill)
    
    // Parse additional charges list from notes
    let additionalChargesList = []
    try {
      if (bill.notes && bill.notes.includes('[{')) {
        additionalChargesList = JSON.parse(bill.notes)
      }
    } catch (e) {
      console.error('Error parsing additional charges:', e)
    }
    
    if (!Array.isArray(additionalChargesList) || additionalChargesList.length === 0) {
      additionalChargesList = [{ heading: "", amount: 0 }]
    }
    
    setEditBillForm({
      bedCharges: bill.bedCharges || 0,
      roomCharges: bill.roomCharges || 0,
      icuCharges: bill.icuCharges || 0,
      nursingCharges: bill.nursingCharges || 0,
      doctorFees: bill.doctorFees || 0,
      additionalCharges: 0,
      additionalChargesList: additionalChargesList,
      notes: typeof bill.notes === 'string' && !bill.notes.includes('[{') ? bill.notes : ""
    })
    
    setIsEditMode(true)
    setShowViewIPDBillDialog(true)
  }

  const handleSaveIPDBill = async () => {
    if (!selectedIPDBill) return
    
    try {
      // Calculate total additional charges from the list
      const totalAdditionalCharges = editBillForm.additionalChargesList.reduce(
        (sum, charge) => sum + (charge.amount || 0), 
        0
      )
      
      await updateIPDBill(selectedIPDBill.id, {
        bedCharges: editBillForm.bedCharges,
        roomCharges: editBillForm.roomCharges,
        icuCharges: editBillForm.icuCharges,
        nursingCharges: editBillForm.nursingCharges,
        doctorFees: editBillForm.doctorFees,
        additionalCharges: editBillForm.additionalCharges + totalAdditionalCharges,
        notes: JSON.stringify(editBillForm.additionalChargesList.filter(c => c.heading && c.amount > 0))
      })
      
      setIsEditMode(false)
      setShowViewIPDBillDialog(false)
      
      // Refresh bills
      await getIPDPendingBills()
    } catch (error) {
      console.error('Error updating bill:', error)
    }
  }

  const handleGenerateIPDBill = () => {
    toast({
      title: "IPD Bill Generated",
      description: "Bill has been generated successfully",
    })
  }

  const handlePrintIPDBill = () => {
    if (!selectedIPDBill) {
      toast({
        title: "Print Error",
        description: "No bill selected",
        variant: "destructive"
      })
      return
    }

    const bill = selectedIPDBill
    const patient = bill.admission?.patient
    const admission = bill.admission
    const bed = admission?.bed
    const ward = bed?.ward

    // Create a print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: "Print Blocked",
        description: "Please allow pop-ups to print",
        variant: "destructive"
      })
      return
    }

    // Calculate totals
    const roomCharges = bill.roomCharges || 0
    const doctorFees = bill.doctorFees || 0
    const nursingCharges = bill.nursingCharges || 0
    const medicineCharges = bill.medicineCharges || 0
    const labCharges = bill.labCharges || 0
    const otCharges = bill.otCharges || 0
    const miscCharges = bill.miscCharges || 0
    const totalAmount = bill.totalAmount || 0
    const discount = bill.discount || 0
    const serviceCharge = totalAmount * 0.15 // 15% service charge
    const billAmount = totalAmount - discount
    const roundOff = 0
    const finalTotal = billAmount + roundOff

    // Convert number to words
    const numberToWords = (num: number) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
      
      if (num === 0) return 'Zero'
      
      const crores = Math.floor(num / 10000000)
      const lakhs = Math.floor((num % 10000000) / 100000)
      const thousands = Math.floor((num % 100000) / 1000)
      const hundreds = Math.floor((num % 1000) / 100)
      const remainder = num % 100
      
      let words = ''
      
      if (crores > 0) words += ones[crores] + ' Crore '
      if (lakhs > 0) words += (lakhs < 10 ? ones[lakhs] : (lakhs < 20 ? teens[lakhs - 10] : tens[Math.floor(lakhs / 10)] + ' ' + ones[lakhs % 10])) + ' Lakh '
      if (thousands > 0) words += (thousands < 10 ? ones[thousands] : (thousands < 20 ? teens[thousands - 10] : tens[Math.floor(thousands / 10)] + ' ' + ones[thousands % 10])) + ' Thousand '
      if (hundreds > 0) words += ones[hundreds] + ' Hundred '
      if (remainder > 0) {
        if (remainder < 10) words += ones[remainder]
        else if (remainder < 20) words += teens[remainder - 10]
        else words += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10]
      }
      
      return words.trim() + ' Only'
    }

    const amountInWords = numberToWords(Math.floor(finalTotal))

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IPD Bill - ${bill.billNumber || bill.id.slice(0, 8)}</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm; 
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 11px;
              line-height: 1.4;
              color: #000;
              padding: 20px;
            }
            .header-line {
              text-align: right;
              font-size: 10px;
              margin-bottom: 2px;
            }
            .separator {
              border-top: 1px solid #000;
              margin: 5px 0;
            }
            .double-separator {
              border-top: 3px double #000;
              margin: 5px 0;
            }
            .bill-title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              margin: 10px 0;
              text-decoration: underline;
            }
            .info-section {
              margin: 10px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .info-label {
              font-weight: normal;
              min-width: 120px;
            }
            .info-value {
              flex: 1;
              text-align: left;
            }
            .section-header {
              background-color: #f0f0f0;
              padding: 4px 8px;
              font-weight: bold;
              margin-top: 15px;
              border: 1px solid #000;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 5px 0;
            }
            th {
              background-color: #fff;
              border: 1px solid #000;
              padding: 6px 8px;
              text-align: left;
              font-weight: bold;
              font-size: 10px;
            }
            td {
              border: 1px solid #000;
              padding: 5px 8px;
              font-size: 10px;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .final-total {
              font-size: 11px;
              font-weight: bold;
            }
            .amount-words {
              margin: 10px 0;
              padding: 8px;
              background-color: #f5f5f5;
              border: 1px solid #ccc;
              font-style: italic;
            }
            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 200px;
              margin-top: 60px;
              padding-top: 5px;
              text-align: center;
            }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header-line">Pan No. : AAUCS6437L</div>
          <div class="header-line">Sv Tax No.: ABDPH9183MSD001</div>
          <div class="double-separator"></div>
          
          <div class="bill-title">BILL</div>
          
          <!-- Patient and Insurance Info -->
          <div class="info-section">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 48%;">
                <div class="info-row">
                  <span class="info-label">To</span>
                </div>
                <div class="info-row">
                  <strong>INSURANCE COMPANY</strong>
                </div>
                <div class="info-row">
                  <span>Name of Patient :</span>
                  <span><strong>${patient?.firstName || ''} ${patient?.lastName || ''}</strong></span>
                </div>
                <div class="info-row">
                  <span>CLAIM NO.</span>
                  <span>: ${bill.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span>POLICY NO.</span>
                  <span>: 000000001618420S-05 2025</span>
                </div>
                <div class="info-row">
                  <span>Patient Address</span>
                  <span>: ${patient?.address || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span>Admission Date</span>
                  <span>: ${admission?.admissionTime ? new Date(admission.admissionTime).toLocaleDateString('en-IN') : 'N/A'} Time: ${admission?.admissionTime ? new Date(admission.admissionTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'}) : 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span>Discharge Date</span>
                  <span>: ${admission?.dischargeTime ? new Date(admission.dischargeTime).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')} Time: ${admission?.dischargeTime ? new Date(admission.dischargeTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'}) : new Date().toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
                <div class="info-row">
                  <span>Doctor In Charge :</span>
                  <span>${admission?.doctor ? `DR.${admission.doctor.firstName} ${admission.doctor.lastName}`.toUpperCase() : 'DR.ATTENDING PHYSICIAN'}</span>
                </div>
              </div>
              <div style="width: 48%; text-align: right;">
                <div class="info-row">
                  <span>Insurance Bill No. :</span>
                </div>
                <div class="info-row">
                  <span>SI No.</span>
                  <span>: ${bill.billNumber || bill.id.slice(0, 12).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span>Date</span>
                  <span>: ${new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div class="info-row">
                  <span>Regd. No.</span>
                  <span>: ${patient?.patientId || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span>Age</span>
                  <span>: ${patient?.age || patient?.dateOfBirth ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span>Sex</span>
                  <span>: ${patient?.gender || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span>Pan No.</span>
                  <span>: AAUCS6437L</span>
                </div>
                <div class="info-row">
                  <span>CIN No.</span>
                  <span>: U85100WB2014PTC200561</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Charges Table -->
          <table style="margin-top: 15px;">
            <thead>
              <tr>
                <th style="width: 45%;">Description</th>
                <th style="width: 15%;" class="text-center">Unit</th>
                <th style="width: 12%;" class="text-right">Rate</th>
                <th style="width: 12%;" class="text-right">Amount</th>
                <th style="width: 10%;" class="text-right">Serv. Ch.<br/>(15.00%)</th>
                <th style="width: 12%;" class="text-right">Gross</th>
              </tr>
            </thead>
            <tbody>
              ${roomCharges > 0 ? `
              <tr>
                <td colspan="6" style="background-color: #f0f0f0; font-weight: bold;">BED CHARGES ::</td>
              </tr>
              <tr>
                <td>Delux General Ward Bed No. : ${bed?.bedNumber || 'N/A'}</td>
                <td class="text-center">Days / ${Math.ceil((new Date().getTime() - new Date(admission?.admissionTime || new Date()).getTime()) / (1000 * 60 * 60 * 24))}</td>
                <td class="text-right">${(roomCharges / Math.max(1, Math.ceil((new Date().getTime() - new Date(admission?.admissionTime || new Date()).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2)}</td>
                <td class="text-right">${roomCharges.toFixed(2)}</td>
                <td class="text-right">${(roomCharges * 0.15).toFixed(2)}</td>
                <td class="text-right">${(roomCharges + roomCharges * 0.15).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${nursingCharges > 0 || true ? `
              <tr>
                <td colspan="6" style="background-color: #f0f0f0; font-weight: bold;">GENERAL CHARGES</td>
              </tr>
              <tr>
                <td>ATTENDANT CHARGES</td>
                <td class="text-center">DAY / 5</td>
                <td class="text-right">200.00</td>
                <td class="text-right">${(nursingCharges || 1000).toFixed(2)}</td>
                <td class="text-right">Nil</td>
                <td class="text-right">${(nursingCharges || 1000).toFixed(2)}</td>
              </tr>
              <tr>
                <td>RECORD KEEPING CHARGES</td>
                <td class="text-center">CASE / 1</td>
                <td class="text-right">200.00</td>
                <td class="text-right">200.00</td>
                <td class="text-right">Nil</td>
                <td class="text-right">200.00</td>
              </tr>
              <tr>
                <td>PATIENT IDENTIFICATION TAG</td>
                <td class="text-center">CASE / 1</td>
                <td class="text-right">30.00</td>
                <td class="text-right">30.00</td>
                <td class="text-right">Nil</td>
                <td class="text-right">30.00</td>
              </tr>
              ` : ''}
              ${bed ? `
              <tr>
                <td colspan="6" style="background-color: #f0f0f0; font-weight: bold;">WARD ITEMS</td>
              </tr>
              <tr>
                <td>PATIENT C.B. (WARD)</td>
                <td class="text-center">UNIT / 17</td>
                <td class="text-right">100.00</td>
                <td class="text-right">1,700.00</td>
                <td class="text-right">Nil</td>
                <td class="text-right">1,700.00</td>
              </tr>
              ` : ''}
              ${doctorFees > 0 ? `
              <tr>
                <td colspan="6" style="background-color: #f0f0f0; font-weight: bold;">DOCTOR CHARGES ::</td>
              </tr>
              <tr>
                <td>CONSULTANT - ${admission?.doctor ? `DR.${admission.doctor.firstName} ${admission.doctor.lastName}`.toUpperCase() : 'DR.ATTENDING PHYSICIAN'}</td>
                <td class="text-center">VISIT / 6</td>
                <td class="text-right">${(doctorFees / 6).toFixed(2)}</td>
                <td class="text-right">${doctorFees.toFixed(2)}</td>
                <td class="text-right">Nil</td>
                <td class="text-right">${doctorFees.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${(labCharges > 0 || medicineCharges > 0) ? `
              <tr>
                <td colspan="6" style="background-color: #f0f0f0; font-weight: bold;">OTHER CHARGES ::</td>
              </tr>
              ${labCharges > 0 ? `
              <tr>
                <td>DIAGNOSTIC DIVISION</td>
                <td class="text-center"></td>
                <td class="text-right"></td>
                <td class="text-right">${labCharges.toFixed(2)}</td>
                <td class="text-right">Nil</td>
                <td class="text-right">${labCharges.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${medicineCharges > 0 ? `
              <tr>
                <td>MEDICAL STORE</td>
                <td class="text-center"></td>
                <td class="text-right"></td>
                <td class="text-right">${medicineCharges.toFixed(2)}</td>
                <td class="text-right">Nil</td>
                <td class="text-right">${medicineCharges.toFixed(2)}</td>
              </tr>
              ` : ''}
              ` : ''}
              <!-- Totals -->
              <tr class="total-row">
                <td colspan="3" class="text-right">Total ::</td>
                <td class="text-right">${totalAmount.toFixed(2)}</td>
                <td class="text-right">${serviceCharge.toFixed(2)}</td>
                <td class="text-right">${(totalAmount + serviceCharge).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right">Less : Discount</td>
                <td colspan="3" class="text-right">${discount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" class="text-right">Bill Amount</td>
                <td colspan="3" class="text-right final-total">${billAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right">Round Off</td>
                <td colspan="3" class="text-right">(+) ${roundOff.toFixed(2)}</td>
              </tr>
              <tr class="total-row" style="background-color: #e0e0e0;">
                <td colspan="3" class="text-right final-total">Total</td>
                <td colspan="3" class="text-right final-total">${finalTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Amount in Words -->
          <div class="amount-words">
            <strong>Bill Amount In Words :</strong><br/>
            Rupees. ${amountInWords}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div>
              <div class="signature-line">Signature of Patient / Guardian</div>
            </div>
            <div style="text-align: right;">
              <div><strong>For : SRIJANI HEALING HOME</strong></div>
              <div class="signature-line" style="margin-left: auto;">Authorized Signatory</div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 300)

    toast({
      title: "Print Ready",
      description: "Opening print dialog...",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      Paid: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      Pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
      Interim: { color: "bg-blue-100 text-blue-700", icon: FileText },
      Running: { color: "bg-purple-100 text-purple-700", icon: Activity },
      Finalized: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      Approved: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      Rejected: { color: "bg-red-100 text-red-700", icon: AlertTriangle },
      Applied: { color: "bg-blue-100 text-blue-700", icon: CheckCircle },
      Success: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      Completed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    }
    const variant = variants[status] || { color: "bg-gray-100 text-gray-700", icon: Clock }
    const Icon = variant.icon
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  return (
    <AuthProvider>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
              <p className="text-muted-foreground">Comprehensive billing management system</p>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="opd">OPD Billing</TabsTrigger>
              <TabsTrigger value="ipd">IPD Billing</TabsTrigger>
              <TabsTrigger value="insurance">Insurance/TPA</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{mockDashboardStats.todayCollections.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+12.5%</span> from yesterday
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Receivables</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{mockDashboardStats.outstandingReceivables.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">+5.2%</span> pending
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pending TPA Claims</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockDashboardStats.pendingTPAClaims}</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Open Interim Bills</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockDashboardStats.openInterimBills}</div>
                    <p className="text-xs text-muted-foreground mt-1">Requires settlement</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Date Range</Label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="opd">OPD</SelectItem>
                          <SelectItem value="ipd">IPD</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Payment Mode</Label>
                      <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modes</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Source */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Revenue by Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRevenueBySource.map(item => {
                      const widthClass =
                        item.percentage >= 50
                          ? "w-1/2"
                          : item.percentage >= 30
                            ? "w-1/3"
                            : item.percentage >= 10
                              ? "w-1/6"
                              : "w-1/12"
                      return (
                        <div key={item.source} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.source}</span>
                            <span className="text-muted-foreground">
                              ₹{item.amount.toLocaleString()} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} ${widthClass}`} />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Daily Collections Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chart visualization (30-day trend)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* OPD Billing Tab */}
            <TabsContent value="opd" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>OPD Billing</CardTitle>
                      <CardDescription>Manage outpatient billing and consultations</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search bills..." 
                          className="pl-10 w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button onClick={() => setShowOPDDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Bill
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Pending Visits Section */}
                  {pendingVisits.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-orange-600">
                        ⚠️ Visits Pending Billing ({pendingVisits.length})
                      </h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="grid gap-2">
                          {pendingVisits.slice(0, 5).map((visit) => (
                            <div key={visit.id} className="flex items-center justify-between bg-white p-3 rounded border">
                              <div className="flex-1">
                                <div className="font-medium">{visit.patient.name || `${visit.patient.firstName} ${visit.patient.lastName}`}</div>
                                <div className="text-sm text-muted-foreground">
                                  UHID: {visit.patient.patientId} | Visit: {visit.visitNumber || visit.visitId} | 
                                  Date: {new Date(visit.visitDate).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Dr. {visit.doctor.name || `${visit.doctor.firstName} ${visit.doctor.lastName}`} | {visit.department?.name || 'N/A'}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  handleVisitSelect(visit)
                                  setShowOPDDialog(true)
                                }}
                              >
                                Create Bill
                              </Button>
                            </div>
                          ))}
                          {pendingVisits.length > 5 && (
                            <div className="text-center text-sm text-muted-foreground">
                              ...and {pendingVisits.length - 5} more visits pending billing
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Bills - Now with Separate Sections */}
                  
                  {/* Pending Bills Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">
                      💳 Pending Payments ({existingBills.filter(bill => bill.paymentStatus === 'PENDING').length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Patient UHID</TableHead>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {existingBills.filter(bill => bill.paymentStatus === 'PENDING').length > 0 ? (
                          existingBills
                            .filter(bill => bill.paymentStatus === 'PENDING')
                            .filter(bill => 
                              !searchTerm || 
                              `${bill.opdVisit.patient.firstName} ${bill.opdVisit.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              bill.opdVisit.patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              bill.id.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(bill => (
                              <TableRow key={bill.id}>
                                <TableCell className="font-mono">{bill.id.slice(0, 8)}...</TableCell>
                                <TableCell>{bill.opdVisit.patient.patientId}</TableCell>
                                <TableCell className="font-medium">{`${bill.opdVisit.patient.firstName} ${bill.opdVisit.patient.lastName}`}</TableCell>
                                <TableCell>Dr. {`${bill.opdVisit.doctor.firstName} ${bill.opdVisit.doctor.lastName}`}</TableCell>
                                <TableCell className="font-medium">₹{bill.totalAmount.toLocaleString()}</TableCell>
                                <TableCell className="font-medium text-orange-600">₹{bill.balanceAmount.toLocaleString()}</TableCell>
                                <TableCell>{getStatusBadge(bill.paymentStatus)}</TableCell>
                                <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => openPaymentDialog(bill)}
                                      disabled={bill.balanceAmount <= 0}
                                    >
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Pay
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => printCompletedBill(bill)}
                                    >
                                      <Printer className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No pending payments found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Completed Bills Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 text-green-600">
                      ✅ Completed Bills (Print Available) ({completedBills.length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Patient UHID</TableHead>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Paid Amount</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedBills.length > 0 ? (
                          completedBills
                            .filter(bill => 
                              !searchTerm || 
                              `${bill.opdVisit.patient.firstName} ${bill.opdVisit.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              bill.opdVisit.patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              bill.id.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(bill => (
                              <TableRow key={bill.id}>
                                <TableCell className="font-mono">{bill.id.slice(0, 8)}...</TableCell>
                                <TableCell>{bill.opdVisit.patient.patientId}</TableCell>
                                <TableCell className="font-medium">{`${bill.opdVisit.patient.firstName} ${bill.opdVisit.patient.lastName}`}</TableCell>
                                <TableCell>Dr. {`${bill.opdVisit.doctor.firstName} ${bill.opdVisit.doctor.lastName}`}</TableCell>
                                <TableCell className="font-medium">₹{bill.totalAmount.toLocaleString()}</TableCell>
                                <TableCell className="font-medium text-green-600">₹{bill.paidAmount.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{bill.paymentMethod || 'N/A'}</Badge>
                                </TableCell>
                                <TableCell>{bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="default" 
                                      size="sm"
                                      onClick={() => printCompletedBill(bill)}
                                    >
                                      <Printer className="h-4 w-4 mr-1" />
                                      Print
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No completed bills found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* IPD Billing Tab */}
            <TabsContent value="ipd" className="space-y-6">
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
                    <div className="text-2xl font-bold">{ipdBills.filter(b => b.paymentStatus === 'PENDING').length}</div>
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
                      ₹{ipdBills.reduce((sum, bill) => sum + (bill.balanceAmount || 0), 0).toLocaleString()}
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
                    <div className="text-2xl font-bold">₹{ipdBills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0).toLocaleString()}</div>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Admission</TableHead>
                          <TableHead>Ward/Bed</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Paid Amount</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ipdBills.length > 0 ? (
                          ipdBills.map((bill) => (
                            <TableRow key={bill.id} className="border-b hover:bg-gray-50">
                              <TableCell className="p-2 font-medium">{bill.id.substring(0, 8)}</TableCell>
                              <TableCell className="p-2">
                                <div>
                                  <div className="font-medium">
                                    {bill.admission?.patient?.firstName} {bill.admission?.patient?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {bill.admission?.patient?.patientId}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-2">{bill.admissionId.substring(0, 8)}</TableCell>
                              <TableCell className="p-2">
                                {bill.admission?.bed?.ward?.name || 'N/A'} - {bill.admission?.bed?.bedNumber || 'N/A'}
                              </TableCell>
                              <TableCell className="p-2">₹{(bill.totalAmount || 0).toLocaleString()}</TableCell>
                              <TableCell className="p-2">₹{(bill.paidAmount || 0).toLocaleString()}</TableCell>
                              <TableCell className="p-2">₹{(bill.balanceAmount || 0).toLocaleString()}</TableCell>
                              <TableCell className="p-2">{getStatusBadge(bill.paymentStatus)}</TableCell>
                              <TableCell className="p-2">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewIPDBill(bill)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  {bill.paymentStatus !== 'COMPLETED' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditIPDBill(bill)}
                                      >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => openIPDPaymentDialog(bill)}
                                      >
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        Pay
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No IPD bills found. Create a new bill to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance/TPA Tab */}
            <TabsContent value="insurance" className="space-y-6">
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
                      ₹{insuranceClaims.reduce((sum, claim) => sum + (claim.claimedAmount || 0), 0).toLocaleString()}
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Claim ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Insurance Provider</TableHead>
                          <TableHead>Policy Number</TableHead>
                          <TableHead>Claimed Amount</TableHead>
                          <TableHead>Approved Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {insuranceClaims.length > 0 ? (
                          insuranceClaims.map((claim) => (
                            <TableRow key={claim.id} className="border-b hover:bg-gray-50">
                              <TableCell className="p-2 font-medium">{claim.id.substring(0, 8)}</TableCell>
                              <TableCell className="p-2">
                                <div>
                                  <div className="font-medium">
                                    {claim.admission?.patient?.firstName} {claim.admission?.patient?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {claim.admission?.patient?.patientId}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-2">{claim.insuranceProvider}</TableCell>
                              <TableCell className="p-2">{claim.policyNumber}</TableCell>
                              <TableCell className="p-2">₹{(claim.claimedAmount || 0).toLocaleString()}</TableCell>
                              <TableCell className="p-2">₹{(claim.approvedAmount || 0).toLocaleString()}</TableCell>
                              <TableCell className="p-2">{getStatusBadge(claim.status)}</TableCell>
                              <TableCell className="p-2">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedClaim(claim)
                                      setShowViewClaimDialog(true)
                                    }}
                                  >
                                    View
                                  </Button>
                                  {claim.status === 'PENDING' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={async () => {
                                          await approveClaim(claim.id, {
                                            approvedAmount: claim.claimedAmount,
                                            reviewedBy: "admin",
                                            remarks: "Approved"
                                          })
                                        }}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={async () => {
                                          await rejectClaim(claim.id, {
                                            rejectionReason: "Policy not valid",
                                            reviewedBy: "admin"
                                          })
                                        }}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No insurance claims found. Create a new claim to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ledger Tab */}
            <TabsContent value="ledger" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Ledger</CardTitle>
                  <CardDescription>All transactions and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Bill ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLedgerTransactions.map(txn => (
                        <TableRow key={txn.txnId}>
                          <TableCell className="font-mono">{txn.txnId}</TableCell>
                          <TableCell>{txn.date}</TableCell>
                          <TableCell>{txn.type}</TableCell>
                          <TableCell>{txn.patientUhid}</TableCell>
                          <TableCell className="font-medium">₹{txn.amount.toLocaleString()}</TableCell>
                          <TableCell>{txn.mode}</TableCell>
                          <TableCell>{getStatusBadge(txn.status)}</TableCell>
                          <TableCell>{txn.billId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* OPD Billing Dialog */}
          <Dialog open={showOPDDialog} onOpenChange={setShowOPDDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create OPD Bill</DialogTitle>
                <DialogDescription className="text-base">Generate new outpatient billing invoice</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Patient Search */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Patient & Visit Selection</div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <Label>Search Patient / OPD Visit *</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search by patient name, UHID, or visit number..."
                          value={opdBillingForm.patientSearch}
                          onChange={e => {
                            setOpdBillingForm({ ...opdBillingForm, patientSearch: e.target.value })
                            handlePatientSearch(e.target.value)
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const recentVisits = await getVisits({ limit: 20 })
                              setSearchResults(recentVisits)
                              setShowSearchResults(true)
                              toast({
                                title: "Recent Visits Loaded",
                                description: `Showing ${recentVisits.length} recent visits`
                              })
                            } catch (error) {
                              console.error('Error loading recent visits:', error)
                            }
                          }}
                        >
                          Recent Visits
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Search and select an existing OPD visit to create billing
                      </p>
                      
                      {/* Search Results Dropdown */}
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                          {searchResults.map((result) => {
                            // Handle both comprehensive data structure and regular visit structure
                            const patient = result.patient || result
                            const visit = result.visit || result
                            const doctor = result.doctor || visit.doctor
                            const department = result.department || visit.department
                            const billing = result.billing || visit.billing
                            
                            return (
                              <div
                                key={visit.id || result.id}
                                className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                  billing?.paymentStatus === 'COMPLETED' ? 'bg-green-50' : 
                                  billing ? 'bg-yellow-50' : ''
                                }`}
                                onClick={() => handleVisitSelect(result)}
                              >
                                <div className="font-medium">
                                  {patient.fullName || patient.name || `${patient.firstName} ${patient.lastName}`}
                                </div>
                                <div className="text-sm text-gray-600">
                                  UHID: {patient.patientId} | Visit: {visit.visitId || visit.visitNumber}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Date: {new Date(visit.visitDate).toLocaleDateString()} | 
                                  Dr. {doctor?.name || `${doctor?.firstName} ${doctor?.lastName}`} | 
                                  {department?.name}
                                </div>
                                {billing?.paymentStatus === 'COMPLETED' && (
                                  <div className="text-xs text-green-700 font-medium">
                                    ✅ Billing Completed - Paid: ₹{billing.paidAmount}
                                  </div>
                                )}
                                {billing && billing.paymentStatus !== 'COMPLETED' && (
                                  <div className="text-xs text-orange-600">
                                    ⚠️ Billing exists - Status: {billing.paymentStatus} - Balance: ₹{billing.balanceAmount}
                                  </div>
                                )}
                                {!billing && (
                                  <div className="text-xs text-blue-600">
                                    📋 Ready for billing
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Visit Info */}
                    {selectedVisit && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-blue-900">Selected Visit</div>
                            <div className="text-sm text-blue-700">
                              {selectedVisit.patient.name || `${selectedVisit.patient.firstName} ${selectedVisit.patient.lastName}`} ({selectedVisit.patient.patientId})
                            </div>
                            <div className="text-sm text-blue-700">
                              Visit: {selectedVisit.visitNumber || selectedVisit.visitId} | Date: {new Date(selectedVisit.visitDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-blue-700">
                              Dr. {selectedVisit.doctor.name || `${selectedVisit.doctor.firstName} ${selectedVisit.doctor.lastName}`} | {selectedVisit.department?.name || 'N/A'}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearVisitSelection}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Billing Details */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Billing Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Consultation Fee *</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={opdBillingForm.consultationFee || ""}
                        onChange={e => setOpdBillingForm({ 
                          ...opdBillingForm, 
                          consultationFee: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div>
                      <Label>Additional Charges</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={opdBillingForm.additionalCharges || ""}
                        onChange={e => setOpdBillingForm({ 
                          ...opdBillingForm, 
                          additionalCharges: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div>
                      <Label>Discount</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={opdBillingForm.discount || ""}
                        onChange={e => setOpdBillingForm({ 
                          ...opdBillingForm, 
                          discount: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div>
                      <Label>Tax</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={opdBillingForm.tax || ""}
                        onChange={e => setOpdBillingForm({ 
                          ...opdBillingForm, 
                          tax: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Details */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Payment Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Payment Method</Label>
                      <Select
                        value={opdBillingForm.paymentMethod}
                        onValueChange={(value: any) => setOpdBillingForm({ 
                          ...opdBillingForm, 
                          paymentMethod: value 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="CARD">Card</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="ONLINE">Online Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Paid Amount</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={opdBillingForm.paidAmount || ""}
                        onChange={e => setOpdBillingForm({ 
                          ...opdBillingForm, 
                          paidAmount: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div>
                      <Label>Transaction ID</Label>
                      <Input
                        placeholder="Transaction reference (optional)"
                        value={opdBillingForm.transactionId}
                        onChange={e => setOpdBillingForm({ 
                          ...opdBillingForm, 
                          transactionId: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Additional notes (optional)"
                        rows={2}
                        value={opdBillingForm.notes}
                        onChange={e => setOpdBillingForm({ 
                          ...opdBillingForm, 
                          notes: e.target.value 
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bill Summary */}
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  <div className="text-sm font-semibold">Bill Summary</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Consultation Fee:</span>
                      <span>₹{opdBillingForm.consultationFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Additional Charges:</span>
                      <span>₹{opdBillingForm.additionalCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>₹{opdBillingForm.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span>-₹{opdBillingForm.discount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>₹{(
                        opdBillingForm.consultationFee + 
                        opdBillingForm.additionalCharges + 
                        opdBillingForm.tax - 
                        opdBillingForm.discount
                      ).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Paid Amount:</span>
                      <span>₹{opdBillingForm.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Balance:</span>
                      <span>₹{(
                        opdBillingForm.consultationFee + 
                        opdBillingForm.additionalCharges + 
                        opdBillingForm.tax - 
                        opdBillingForm.discount - 
                        opdBillingForm.paidAmount
                      ).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowOPDDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={handlePrintBill}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Bill
                  </Button>
                  <Button 
                    onClick={handleCreateOPDBill}
                    disabled={opdBillingLoading || !opdBillingForm.opdVisitId || opdBillingForm.consultationFee <= 0}
                  >
                    {opdBillingLoading ? "Creating..." : "Create Bill"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        

          {/* Print Preview Component */}
          {showPrintPreview && (
            <div className="print-only">
              <BillPrintLayout
                ref={printRef}
                patientInfo={patientInfo}
                visitInfo={visitInfo}
                billingCategories={billingCategories}
                billNumber={`2223/SHH/01${Date.now().toString().slice(-3)}`}
                refNumber={`2223/SHH/01${Date.now().toString().slice(-3) + 1}`}
                date={new Date().toLocaleDateString("en-IN")}
                total={total}
                totalDiscount={totalDiscount}
                subtotal={subtotal}
                serviceCharge={serviceCharge}
                billAmount={billAmount}
              />
            </div>
          )}

          {/* Advance Payment Dialog */}
          <Dialog open={showAdvanceDialog} onOpenChange={setShowAdvanceDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Advance Payment</DialogTitle>
                <DialogDescription>Collect advance payment from patient</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Patient UHID *</Label>
                  <Input placeholder="Search patient..." />
                </div>
                <div>
                  <Label>Admission ID (Optional)</Label>
                  <Input placeholder="Link to admission" />
                </div>
                <div>
                  <Label>Advance Amount *</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label>Payment Mode *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transaction Reference</Label>
                  <Input placeholder="Ref number" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="refundable" />
                  <Label htmlFor="refundable">Refundable</Label>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea placeholder="Additional notes..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAdvanceDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecordAdvance}>Record Advance</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Refund Dialog */}
          <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Initiate Refund</DialogTitle>
                <DialogDescription>Process refund or adjustment</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Original Bill ID *</Label>
                  <Input placeholder="Bill/Advance ID" />
                </div>
                <div>
                  <Label>Refund Amount *</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label>Refund Mode *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="neft">NEFT</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason *</Label>
                  <Textarea placeholder="Reason for refund..." />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="approval" />
                  <Label htmlFor="approval">Requires Manager Approval</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInitiateRefund}>Initiate Refund</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Category Dialog */}
          <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Billing Category</DialogTitle>
                <DialogDescription>Create a custom category for billing items</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category Name *</Label>
                  <Input
                    placeholder="e.g., LAB CHARGES, PHARMACY, RADIOLOGY"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addCategory}>Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* New Claim Dialog */}
          <Dialog open={showNewClaimDialog} onOpenChange={setShowNewClaimDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Insurance Claim</DialogTitle>
                <DialogDescription>Submit a new TPA/Insurance claim request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Patient Name *</Label>
                  <Input
                    placeholder="Search or enter patient name"
                    value={claimInfo.patient}
                    onChange={e => setClaimInfo({ ...claimInfo, patient: e.target.value })}
                  />
                </div>
                <div>
                  <Label>TPA/Insurance Provider *</Label>
                  <Select value={claimInfo.tpa} onValueChange={value => setClaimInfo({ ...claimInfo, tpa: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select TPA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Star Health">Star Health</SelectItem>
                      <SelectItem value="HDFC Ergo">HDFC Ergo</SelectItem>
                      <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                      <SelectItem value="Max Bupa">Max Bupa</SelectItem>
                      <SelectItem value="Reliance Health">Reliance Health</SelectItem>
                      <SelectItem value="Care Health">Care Health</SelectItem>
                      <SelectItem value="Bajaj Allianz">Bajaj Allianz</SelectItem>
                      <SelectItem value="New India Assurance">New India Assurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Policy Number *</Label>
                  <Input
                    placeholder="Enter policy number"
                    value={claimInfo.policyNo}
                    onChange={e => setClaimInfo({ ...claimInfo, policyNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Claimed Amount *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={claimInfo.claimedAmount}
                    onChange={e => setClaimInfo({ ...claimInfo, claimedAmount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Approved Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00 (leave blank if pending)"
                    value={claimInfo.approvedAmount}
                    onChange={e => setClaimInfo({ ...claimInfo, approvedAmount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status *</Label>
                  <Select
                    value={claimInfo.status}
                    onValueChange={value => setClaimInfo({ ...claimInfo, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewClaimDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClaim}>Create Claim</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View/Edit Claim Dialog */}
          <Dialog open={showViewClaimDialog} onOpenChange={setShowViewClaimDialog}>
            <DialogContent className="max-w-[98vw] w-full h-[98vh] max-h-[98vh] overflow-y-auto p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center justify-between">
                  <span>{isEditMode ? "Edit Insurance Claim" : "View Insurance Claim"}</span>
                  {!isEditMode && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Enable Edit Mode
                    </Button>
                  )}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedClaim && `Claim ID: ${selectedClaim.claimId} | Policy No: ${selectedClaim.policyNo}`}
                </DialogDescription>
              </DialogHeader>

              {selectedClaim && (
                <>
                  {/* Claim Information */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Claim Information</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Claim ID</Label>
                        <Input value={selectedClaim.claimId} readOnly className="bg-muted font-mono" />
                      </div>
                      <div>
                        <Label>Claim Status *</Label>
                        <Select
                          value={claimInfo.status || selectedClaim.status}
                          onValueChange={value => setClaimInfo({ ...claimInfo, status: value })}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger className={!isEditMode ? "bg-muted" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Claim Date</Label>
                        <Input
                          type="date"
                          defaultValue={new Date().toISOString().split("T")[0]}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Patient Information */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Patient Information</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Patient Name *</Label>
                        <Input
                          placeholder="Enter patient name"
                          defaultValue={selectedClaim.patient}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Patient UHID</Label>
                        <Input
                          placeholder="e.g., PAT001"
                          defaultValue="PAT001"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Age / Gender</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Age"
                            defaultValue="45"
                            readOnly={!isEditMode}
                            className={!isEditMode ? "bg-muted" : ""}
                          />
                          <Select disabled={!isEditMode} defaultValue="Male">
                            <SelectTrigger className={!isEditMode ? "bg-muted" : ""}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <Label>Patient Address</Label>
                        <Input
                          placeholder="Enter complete address"
                          defaultValue="123 Main Street, Kolkata - 700001"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Insurance Details */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Insurance/TPA Details</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>TPA/Insurance Provider *</Label>
                        <Select defaultValue={selectedClaim.tpa} disabled={!isEditMode}>
                          <SelectTrigger className={!isEditMode ? "bg-muted" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Star Health">Star Health</SelectItem>
                            <SelectItem value="HDFC Ergo">HDFC Ergo</SelectItem>
                            <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                            <SelectItem value="Max Bupa">Max Bupa</SelectItem>
                            <SelectItem value="Reliance Health">Reliance Health</SelectItem>
                            <SelectItem value="Care Health">Care Health</SelectItem>
                            <SelectItem value="Bajaj Allianz">Bajaj Allianz</SelectItem>
                            <SelectItem value="New India Assurance">New India Assurance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Policy Number *</Label>
                        <Input
                          placeholder="Enter policy number"
                          defaultValue={selectedClaim.policyNo}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Policy Validity</Label>
                        <Input
                          type="date"
                          defaultValue="2026-12-31"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Pre-Auth Number</Label>
                        <Input
                          placeholder="Enter pre-authorization number"
                          defaultValue="PA123456"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Sum Insured</Label>
                        <Input
                          type="number"
                          placeholder="Total coverage amount"
                          defaultValue="500000"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Co-Payment (%)</Label>
                        <Input
                          type="number"
                          placeholder="Co-payment percentage"
                          defaultValue="10"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Medical Details */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Medical Details</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Admission Date</Label>
                        <Input
                          type="datetime-local"
                          defaultValue="2025-11-01T09:00"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Discharge Date</Label>
                        <Input
                          type="datetime-local"
                          defaultValue="2025-11-05T14:00"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Doctor In Charge</Label>
                        <Input
                          placeholder="Consulting doctor name"
                          defaultValue="Dr. Sarah Johnson"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Diagnosis / Case</Label>
                        <Textarea
                          placeholder="Primary diagnosis and case details"
                          defaultValue="Acute appendicitis with peritonitis - Emergency appendectomy performed"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                          rows={2}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Treatment Summary</Label>
                        <Textarea
                          placeholder="Brief treatment summary"
                          defaultValue="Patient admitted with acute abdomen. Emergency appendectomy performed under GA. Post-op recovery uneventful. Discharged on oral antibiotics."
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Financial Details */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Financial Details</div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Total Bill Amount *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue={selectedClaim.claimedAmount}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Claimed Amount *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue={selectedClaim.claimedAmount}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Approved Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue={selectedClaim.approvedAmount || ""}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Deductible Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="5000"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Non-Payable Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="0"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Co-Payment Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="4000"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Patient Payable</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="9000"
                          readOnly
                          className="bg-muted font-semibold"
                        />
                      </div>
                      <div>
                        <Label>TPA Payable</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="36000"
                          readOnly
                          className="bg-muted font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Documents */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Attached Documents</div>
                      {isEditMode && (
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {["Discharge Summary", "Medical Bills", "Investigation Reports", "Pre-Auth Letter"].map(doc => (
                        <div key={doc} className="border rounded-lg p-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{doc}</div>
                            <div className="text-[10px] text-muted-foreground">PDF • 2.3 MB</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Remarks */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Remarks & Notes</div>
                    <div>
                      <Label>Internal Notes</Label>
                      <Textarea
                        placeholder="Add any internal notes or remarks"
                        defaultValue="Pre-authorization obtained. All documents submitted. Awaiting approval from TPA."
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowViewClaimDialog(false)
                        setIsEditMode(false)
                      }}
                    >
                      Close
                    </Button>
                    {isEditMode ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel Edit
                        </Button>
                        <Button
                          onClick={() => {
                            toast({
                              title: "Claim Updated",
                              description: "Insurance claim has been updated successfully",
                            })
                            setIsEditMode(false)
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPrintPreview(true)
                            toast({
                              title: "Generating Bill",
                              description: "Preparing bill for printing",
                            })
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Bill
                        </Button>
                        <Button
                          onClick={() => {
                            setShowPrintPreview(true)
                            toast({
                              title: "Bill Generated",
                              description: "Insurance claim bill generated successfully",
                            })
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Bill
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Print Preview Dialog with Bill Layout */}
          {showPrintPreview && selectedClaim && (
            <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
              <DialogContent className="max-w-[98vw] w-full h-[98vh] max-h-[98vh] p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="flex items-center justify-between">
                    <span>Bill Preview</span>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
                        Close
                      </Button>
                      <Button onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-auto p-6">
                  <BillPrintLayout
                    ref={printRef}
                    patientInfo={{
                      name: selectedClaim.patient,
                      uhid: "PAT001",
                      age: "45 Years",
                      gender: "Male",
                      pan: "ABCDE1234F",
                      cin: selectedClaim.policyNo,
                      address: "123 Main Street, Kolkata - 700001",
                    }}
                    visitInfo={{
                      admissionDate: "01/11/2025",
                      dischargeDate: "05/11/2025",
                      doctor: "Dr. Sarah Johnson",
                      diagnosis: "Acute appendicitis with peritonitis - Emergency appendectomy performed",
                    }}
                    insuranceInfo={{
                      tpa: selectedClaim.tpa,
                      policyNo: selectedClaim.policyNo,
                      policyValidity: "31/12/2026",
                      preAuthNo: "PA123456",
                      sumInsured: 500000,
                      coPaymentPercent: 10,
                    }}
                    financialInfo={{
                      totalBillAmount: Number(selectedClaim.claimedAmount),
                      claimedAmount: Number(selectedClaim.claimedAmount),
                      approvedAmount: Number(selectedClaim.approvedAmount || selectedClaim.claimedAmount),
                      deductibleAmount: 5000,
                      nonPayableAmount: 0,
                      coPaymentAmount: 4000,
                      patientPayable: 9000,
                      tpaPayable: 36000,
                    }}
                    treatmentSummary="Patient admitted with acute abdomen. Emergency appendectomy performed under GA. Post-op recovery uneventful. Discharged on oral antibiotics with follow-up in 1 week."
                    billingCategories={[
                      {
                        id: "medical-services",
                        name: "MEDICAL SERVICES",
                        items: [
                          {
                            id: "cons-1",
                            description: "Doctor Consultation & Treatment",
                            type: "consultation",
                            rate: 12000,
                            discount: 0,
                            amount: 12000,
                          },
                          {
                            id: "surg-1",
                            description: "Surgical Procedure - Appendectomy",
                            type: "surgery",
                            rate: 15000,
                            discount: 0,
                            amount: 15000,
                          },
                        ],
                      },
                      {
                        id: "hospitalization",
                        name: "HOSPITALIZATION CHARGES",
                        items: [
                          {
                            id: "room-1",
                            description: "Room Rent - General Ward (4 days)",
                            type: "days",
                            rate: 2000,
                            discount: 0,
                            amount: 8000,
                          },
                          {
                            id: "nursing-1",
                            description: "Nursing & Attendant Charges",
                            type: "days",
                            rate: 500,
                            discount: 0,
                            amount: 2000,
                          },
                        ],
                      },
                      {
                        id: "investigations",
                        name: "INVESTIGATIONS & DIAGNOSTICS",
                        items: [
                          {
                            id: "lab-1",
                            description: "Blood Tests - CBC, LFT, RFT",
                            type: "set",
                            rate: 1500,
                            discount: 0,
                            amount: 1500,
                          },
                          {
                            id: "rad-1",
                            description: "USG Abdomen & X-Ray",
                            type: "set",
                            rate: 1500,
                            discount: 0,
                            amount: 1500,
                          },
                        ],
                      },
                      {
                        id: "pharmacy",
                        name: "PHARMACY & MEDICINES",
                        items: [
                          {
                            id: "med-1",
                            description: "IV Antibiotics & Injections",
                            type: "lumpsum",
                            rate: 3000,
                            discount: 0,
                            amount: 3000,
                          },
                          {
                            id: "med-2",
                            description: "Oral Medications & Discharge Medicines",
                            type: "lumpsum",
                            rate: 2000,
                            discount: 0,
                            amount: 2000,
                          },
                        ],
                      },
                      {
                        id: "consumables",
                        name: "CONSUMABLES & SUPPLIES",
                        items: [
                          {
                            id: "cons-1",
                            description: "IV Fluids, Syringes & Dressings",
                            type: "lumpsum",
                            rate: 1500,
                            discount: 0,
                            amount: 1500,
                          },
                          {
                            id: "surg-supplies",
                            description: "Surgical Consumables",
                            type: "lumpsum",
                            rate: 500,
                            discount: 0,
                            amount: 500,
                          },
                        ],
                      },
                    ]}
                    billNumber={selectedClaim?.claimId?.replace("CLM", "BILL") || "BILL-001"}
                    refNumber={selectedClaim?.claimId || "REF-001"}
                    date={new Date().toLocaleDateString("en-GB")}
                    total={selectedClaim?.claimedAmount || 0}
                    totalDiscount={0}
                    subtotal={selectedClaim?.claimedAmount || 0}
                    serviceCharge={(selectedClaim?.claimedAmount || 0) * 0.15}
                    billAmount={(selectedClaim?.claimedAmount || 0) + (selectedClaim?.claimedAmount || 0) * 0.15}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* View/Edit Claim Dialog */}
          <Dialog open={showViewClaimDialog} onOpenChange={setShowViewClaimDialog}>
            <DialogContent className="max-w-[98vw] w-full h-[98vh] max-h-[98vh] overflow-y-auto p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center justify-between">
                  <span>{isEditMode ? "Edit Insurance Claim" : "View Insurance Claim"}</span>
                  {!isEditMode && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Enable Edit Mode
                    </Button>
                  )}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedClaim && `Claim ID: ${selectedClaim.claimId} | Policy No: ${selectedClaim.policyNo}`}
                </DialogDescription>
              </DialogHeader>

              {selectedClaim && (
                <>
                  {/* Claim Information */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Claim Information</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Claim ID</Label>
                        <Input value={selectedClaim.claimId} readOnly className="bg-muted font-mono" />
                      </div>
                      <div>
                        <Label>Claim Status *</Label>
                        <Select
                          value={claimInfo.status || selectedClaim.status}
                          onValueChange={value => setClaimInfo({ ...claimInfo, status: value })}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger className={!isEditMode ? "bg-muted" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Claim Date</Label>
                        <Input
                          type="date"
                          defaultValue={new Date().toISOString().split("T")[0]}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Patient Information */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Patient Information</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Patient Name *</Label>
                        <Input
                          placeholder="Enter patient name"
                          defaultValue={selectedClaim.patient}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Patient UHID</Label>
                        <Input
                          placeholder="e.g., PAT001"
                          defaultValue="PAT001"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Age / Gender</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Age"
                            defaultValue="45"
                            readOnly={!isEditMode}
                            className={!isEditMode ? "bg-muted" : ""}
                          />
                          <Select disabled={!isEditMode} defaultValue="Male">
                            <SelectTrigger className={!isEditMode ? "bg-muted" : ""}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <Label>Patient Address</Label>
                        <Input
                          placeholder="Enter complete address"
                          defaultValue="123 Main Street, Kolkata - 700001"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Insurance Details */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Insurance/TPA Details</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>TPA/Insurance Provider *</Label>
                        <Select defaultValue={selectedClaim.tpa} disabled={!isEditMode}>
                          <SelectTrigger className={!isEditMode ? "bg-muted" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Star Health">Star Health</SelectItem>
                            <SelectItem value="HDFC Ergo">HDFC Ergo</SelectItem>
                            <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                            <SelectItem value="Max Bupa">Max Bupa</SelectItem>
                            <SelectItem value="Reliance Health">Reliance Health</SelectItem>
                            <SelectItem value="Care Health">Care Health</SelectItem>
                            <SelectItem value="Bajaj Allianz">Bajaj Allianz</SelectItem>
                            <SelectItem value="New India Assurance">New India Assurance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Policy Number *</Label>
                        <Input
                          placeholder="Enter policy number"
                          defaultValue={selectedClaim.policyNo}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Policy Validity</Label>
                        <Input
                          type="date"
                          defaultValue="2026-12-31"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Pre-Auth Number</Label>
                        <Input
                          placeholder="Enter pre-authorization number"
                          defaultValue="PA123456"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Sum Insured</Label>
                        <Input
                          type="number"
                          placeholder="Total coverage amount"
                          defaultValue="500000"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Co-Payment (%)</Label>
                        <Input
                          type="number"
                          placeholder="Co-payment percentage"
                          defaultValue="10"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Medical Details */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Medical Details</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Admission Date</Label>
                        <Input
                          type="datetime-local"
                          defaultValue="2025-11-01T09:00"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Discharge Date</Label>
                        <Input
                          type="datetime-local"
                          defaultValue="2025-11-05T14:00"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Doctor In Charge</Label>
                        <Input
                          placeholder="Consulting doctor name"
                          defaultValue="Dr. Sarah Johnson"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Diagnosis / Case</Label>
                        <Textarea
                          placeholder="Primary diagnosis and case details"
                          defaultValue="Acute appendicitis with peritonitis - Emergency appendectomy performed"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                          rows={2}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Treatment Summary</Label>
                        <Textarea
                          placeholder="Brief treatment summary"
                          defaultValue="Patient admitted with acute abdomen. Emergency appendectomy performed under GA. Post-op recovery uneventful. Discharged on oral antibiotics."
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Financial Details */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Financial Details</div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Total Bill Amount *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue={selectedClaim.claimedAmount}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Claimed Amount *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue={selectedClaim.claimedAmount}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Approved Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue={selectedClaim.approvedAmount || ""}
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Deductible Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="5000"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Non-Payable Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="0"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Co-Payment Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="4000"
                          readOnly={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                      </div>
                      <div>
                        <Label>Patient Payable</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="9000"
                          readOnly
                          className="bg-muted font-semibold"
                        />
                      </div>
                      <div>
                        <Label>TPA Payable</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue="36000"
                          readOnly
                          className="bg-muted font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Documents */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Attached Documents</div>
                      {isEditMode && (
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {["Discharge Summary", "Medical Bills", "Investigation Reports", "Pre-Auth Letter"].map(doc => (
                        <div key={doc} className="border rounded-lg p-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{doc}</div>
                            <div className="text-[10px] text-muted-foreground">PDF • 2.3 MB</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Remarks */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">Remarks & Notes</div>
                    <div>
                      <Label>Internal Notes</Label>
                      <Textarea
                        placeholder="Add any internal notes or remarks"
                        defaultValue="Pre-authorization obtained. All documents submitted. Awaiting approval from TPA."
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowViewClaimDialog(false)
                        setIsEditMode(false)
                      }}
                    >
                      Close
                    </Button>
                    {isEditMode ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel Edit
                        </Button>
                        <Button
                          onClick={() => {
                            toast({
                              title: "Claim Updated",
                              description: "Insurance claim has been updated successfully",
                            })
                            setIsEditMode(false)
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPrintPreview(true)
                            toast({
                              title: "Generating Bill",
                              description: "Preparing bill for printing",
                            })
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Bill
                        </Button>
                        <Button
                          onClick={() => {
                            setShowPrintPreview(true)
                            toast({
                              title: "Bill Generated",
                              description: "Insurance claim bill generated successfully",
                            })
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Bill
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Print Preview Dialog with Bill Layout */}
          {showPrintPreview && selectedClaim && (
            <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
              <DialogContent className="max-w-[98vw] w-full h-[98vh] max-h-[98vh] p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="flex items-center justify-between">
                    <span>Bill Preview</span>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
                        Close
                      </Button>
                      <Button onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-auto p-6">
                  <BillPrintLayout
                    ref={printRef}
                    patientInfo={{
                      name: selectedClaim.patient,
                      uhid: "PAT001",
                      age: "45 Years",
                      gender: "Male",
                      pan: "ABCDE1234F",
                      cin: selectedClaim.policyNo,
                      address: "123 Main Street, Kolkata - 700001",
                    }}
                    visitInfo={{
                      admissionDate: "01/11/2025",
                      dischargeDate: "05/11/2025",
                      doctor: "Dr. Sarah Johnson",
                      diagnosis: "Acute appendicitis with peritonitis - Emergency appendectomy performed",
                    }}
                    insuranceInfo={{
                      tpa: selectedClaim.tpa,
                      policyNo: selectedClaim.policyNo,
                      policyValidity: "31/12/2026",
                      preAuthNo: "PA123456",
                      sumInsured: 500000,
                      coPaymentPercent: 10,
                    }}
                    financialInfo={{
                      totalBillAmount: Number(selectedClaim.claimedAmount),
                      claimedAmount: Number(selectedClaim.claimedAmount),
                      approvedAmount: Number(selectedClaim.approvedAmount || selectedClaim.claimedAmount),
                      deductibleAmount: 5000,
                      nonPayableAmount: 0,
                      coPaymentAmount: 4000,
                      patientPayable: 9000,
                      tpaPayable: 36000,
                    }}
                    treatmentSummary="Patient admitted with acute abdomen. Emergency appendectomy performed under GA. Post-op recovery uneventful. Discharged on oral antibiotics with follow-up in 1 week."
                    billingCategories={[
                      {
                        id: "medical-services",
                        name: "MEDICAL SERVICES",
                        items: [
                          {
                            id: "cons-1",
                            description: "Doctor Consultation & Treatment",
                            type: "consultation",
                            rate: 12000,
                            discount: 0,
                            amount: 12000,
                          },
                          {
                            id: "surg-1",
                            description: "Surgical Procedure - Appendectomy",
                            type: "surgery",
                            rate: 15000,
                            discount: 0,
                            amount: 15000,
                          },
                        ],
                      },
                      {
                        id: "hospitalization",
                        name: "HOSPITALIZATION CHARGES",
                        items: [
                          {
                            id: "room-1",
                            description: "Room Rent - General Ward (4 days)",
                            type: "days",
                            rate: 2000,
                            discount: 0,
                            amount: 8000,
                          },
                          {
                            id: "nursing-1",
                            description: "Nursing & Attendant Charges",
                            type: "days",
                            rate: 500,
                            discount: 0,
                            amount: 2000,
                          },
                        ],
                      },
                      {
                        id: "investigations",
                        name: "INVESTIGATIONS & DIAGNOSTICS",
                        items: [
                          {
                            id: "lab-1",
                            description: "Blood Tests - CBC, LFT, RFT",
                            type: "set",
                            rate: 1500,
                            discount: 0,
                            amount: 1500,
                          },
                          {
                            id: "rad-1",
                            description: "USG Abdomen & X-Ray",
                            type: "set",
                            rate: 1500,
                            discount: 0,
                            amount: 1500,
                          },
                        ],
                      },
                      {
                        id: "pharmacy",
                        name: "PHARMACY & MEDICINES",
                        items: [
                          {
                            id: "med-1",
                            description: "IV Antibiotics & Injections",
                            type: "lumpsum",
                            rate: 3000,
                            discount: 0,
                            amount: 3000,
                          },
                          {
                            id: "med-2",
                            description: "Oral Medications & Discharge Medicines",
                            type: "lumpsum",
                            rate: 2000,
                            discount: 0,
                            amount: 2000,
                          },
                        ],
                      },
                      {
                        id: "consumables",
                        name: "CONSUMABLES & SUPPLIES",
                        items: [
                          {
                            id: "cons-1",
                            description: "IV Fluids, Syringes & Dressings",
                            type: "lumpsum",
                            rate: 1500,
                            discount: 0,
                            amount: 1500,
                          },
                          {
                            id: "surg-supplies",
                            description: "Surgical Consumables",
                            type: "lumpsum",
                            rate: 500,
                            discount: 0,
                            amount: 500,
                          },
                        ],
                      },
                    ]}
                    billNumber={selectedClaim?.claimId?.replace("CLM", "BILL") || "BILL-001"}
                    refNumber={selectedClaim?.claimId || "REF-001"}
                    date={new Date().toLocaleDateString("en-GB")}
                    total={selectedClaim?.claimedAmount || 0}
                    totalDiscount={0}
                    subtotal={selectedClaim?.claimedAmount || 0}
                    serviceCharge={(selectedClaim?.claimedAmount || 0) * 0.15}
                    billAmount={(selectedClaim?.claimedAmount || 0) + (selectedClaim?.claimedAmount || 0) * 0.15}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Payment Recording Dialog */}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  {selectedBillForPayment && (
                    <div className="space-y-2 mt-2">
                      <div>Patient: {`${selectedBillForPayment.opdVisit.patient.firstName} ${selectedBillForPayment.opdVisit.patient.lastName}`}</div>
                      <div>Bill ID: {selectedBillForPayment.id.slice(0, 8)}...</div>
                      <div>Total Amount: ₹{selectedBillForPayment.totalAmount.toLocaleString()}</div>
                      <div>Paid Amount: ₹{selectedBillForPayment.paidAmount.toLocaleString()}</div>
                      <div className="font-medium">Balance Amount: ₹{selectedBillForPayment.balanceAmount.toLocaleString()}</div>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Payment Amount *</Label>
                  <Input
                    type="number"
                    placeholder="Enter payment amount"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                    max={selectedBillForPayment?.balanceAmount || 0}
                  />
                </div>
                <div>
                  <Label>Payment Method *</Label>
                  <Select
                    value={paymentForm.paymentMethod}
                    onValueChange={(value: typeof paymentForm.paymentMethod) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                      <SelectItem value="ONLINE">Online Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(paymentForm.paymentMethod === 'CARD' || paymentForm.paymentMethod === 'UPI' || paymentForm.paymentMethod === 'ONLINE') && (
                  <div>
                    <Label>Transaction ID</Label>
                    <Input
                      placeholder="Enter transaction ID"
                      value={paymentForm.transactionId}
                      onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any notes about this payment"
                    value={paymentForm.notes}
                    onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRecordPayment}
                  disabled={paymentForm.amount <= 0 || paymentForm.amount > (selectedBillForPayment?.balanceAmount || 0)}
                >
                  Record Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* IPD Bill Creation Dialog */}
          <Dialog open={showIPDBillingDialog} onOpenChange={setShowIPDBillingDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create IPD Bill</DialogTitle>
                <DialogDescription className="text-base">Generate new inpatient billing invoice</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Admission Search */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Admission Selection</div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Search Admission / Patient *</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by patient name, UHID, or admission ID..."
                          value={ipdBillForm.patientSearch}
                          onChange={e => setIpdBillForm({ ...ipdBillForm, patientSearch: e.target.value })}
                          className="pl-10"
                        />
                        {ipdSearchLoading && (
                          <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Search Results */}
                      {showIpdSearchResults && (
                        <Card className="absolute z-10 w-full max-h-60 overflow-y-auto">
                          <CardContent className="p-0">
                            {ipdSearchResults.map((admission) => (
                              <div
                                key={admission.id}
                                className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                                onClick={() => handleAdmissionSelect(admission)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {admission.patient.firstName} {admission.patient.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      UHID: {admission.patient.patientId} • Phone: {admission.patient.phone}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Admission: {admission.admissionId} • {admission.bed?.ward?.name} - Bed {admission.bed?.bedNumber}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {admission.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {ipdSearchResults.length === 0 && (
                              <div className="p-3 text-center text-muted-foreground">
                                No admissions found
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Search and select an active admission to create billing
                      </p>
                      
                      {/* Selected Admission Display */}
                      {selectedAdmission && (
                        <Card className="p-3 bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {selectedAdmission.patient.firstName} {selectedAdmission.patient.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                UHID: {selectedAdmission.patient.patientId} • Admission: {selectedAdmission.admissionId}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {selectedAdmission.bed?.ward?.name} - Bed {selectedAdmission.bed?.bedNumber}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={clearAdmissionSelection}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      )}
                    </div>
                    {selectedAdmission && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="font-medium">Selected Admission</div>
                        <div className="text-sm text-blue-700">{(selectedAdmission.patient?.firstName || selectedAdmission.patientData?.firstName) + ' ' + (selectedAdmission.patient?.lastName || selectedAdmission.patientData?.lastName)}</div>
                        <div className="text-sm text-muted-foreground">Admission ID: {selectedAdmission.admissionId || selectedAdmission.id}</div>
                        <div className="text-sm text-muted-foreground">Bed: {selectedAdmission.bed?.bedNumber || selectedAdmission.bed?.id || 'N/A'} • Ward: {selectedAdmission.bed?.ward?.name || 'N/A'}</div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Billing Details */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Billing Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bed Charges</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={ipdBillForm.bedCharges || ""}
                        onChange={e => setIpdBillForm({ 
                          ...ipdBillForm, 
                          bedCharges: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div>
                      <Label>Room Charges</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={ipdBillForm.roomCharges || ""}
                        onChange={e => setIpdBillForm({ 
                          ...ipdBillForm, 
                          roomCharges: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div>
                      <Label>ICU Charges</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={ipdBillForm.icuCharges || ""}
                        onChange={e => setIpdBillForm({ 
                          ...ipdBillForm, 
                          icuCharges: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div>
                      <Label>Nursing Charges</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={ipdBillForm.nursingCharges || ""}
                        onChange={e => setIpdBillForm({ 
                          ...ipdBillForm, 
                          nursingCharges: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div>
                      <Label>Doctor Fees</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={ipdBillForm.doctorFees || ""}
                        onChange={e => setIpdBillForm({ 
                          ...ipdBillForm, 
                          doctorFees: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Charges Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-semibold">Additional Charges</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIpdBillForm({
                          ...ipdBillForm,
                          additionalChargesList: [
                            ...ipdBillForm.additionalChargesList,
                            { heading: "", amount: 0 }
                          ]
                        })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Charge
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {ipdBillForm.additionalChargesList.map((charge, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-6">
                          <Label>Charge Description</Label>
                          <Input
                            placeholder="e.g., Medical Supplies, Special Equipment"
                            value={charge.heading}
                            onChange={e => {
                              const updated = [...ipdBillForm.additionalChargesList]
                              updated[index].heading = e.target.value
                              setIpdBillForm({ ...ipdBillForm, additionalChargesList: updated })
                            }}
                          />
                        </div>
                        <div className="col-span-4">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={charge.amount || ""}
                            onChange={e => {
                              const updated = [...ipdBillForm.additionalChargesList]
                              updated[index].amount = parseFloat(e.target.value) || 0
                              setIpdBillForm({ ...ipdBillForm, additionalChargesList: updated })
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          {ipdBillForm.additionalChargesList.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = ipdBillForm.additionalChargesList.filter((_, i) => i !== index)
                                setIpdBillForm({ ...ipdBillForm, additionalChargesList: updated })
                              }}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Additional Information</div>
                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Add any notes or remarks..."
                      rows={3}
                      value={ipdBillForm.notes}
                      onChange={e => setIpdBillForm({ 
                        ...ipdBillForm, 
                        notes: e.target.value 
                      })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Bill Summary */}
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  <div className="text-sm font-semibold">Bill Summary</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Bed Charges:</span>
                      <span>₹{ipdBillForm.bedCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Room Charges:</span>
                      <span>₹{ipdBillForm.roomCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ICU Charges:</span>
                      <span>₹{ipdBillForm.icuCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Nursing Charges:</span>
                      <span>₹{ipdBillForm.nursingCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Doctor Fees:</span>
                      <span>₹{ipdBillForm.doctorFees.toFixed(2)}</span>
                    </div>
                    {ipdBillForm.additionalChargesList.some(c => c.heading && c.amount > 0) && (
                      <>
                        <Separator className="my-2" />
                        <div className="text-xs font-medium text-muted-foreground mb-1">Additional Charges:</div>
                        {ipdBillForm.additionalChargesList
                          .filter(c => c.heading && c.amount > 0)
                          .map((charge, idx) => (
                            <div key={idx} className="flex justify-between text-sm pl-2">
                              <span className="text-muted-foreground">{charge.heading}:</span>
                              <span>₹{charge.amount.toFixed(2)}</span>
                            </div>
                          ))}
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Additional Charges (Old):</span>
                      <span>₹{ipdBillForm.additionalCharges.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>₹{(
                        ipdBillForm.bedCharges + 
                        ipdBillForm.roomCharges + 
                        ipdBillForm.icuCharges +
                        ipdBillForm.nursingCharges +
                        ipdBillForm.doctorFees +
                        ipdBillForm.additionalCharges +
                        ipdBillForm.additionalChargesList.reduce((sum, c) => sum + (c.amount || 0), 0)
                      ).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowIPDBillingDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateIPDBill}
                    disabled={ipdBillingLoading || !ipdBillForm.admissionId}
                  >
                    {ipdBillingLoading ? "Creating..." : "Create IPD Bill"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* View IPD Bill Dialog */}
          <Dialog open={showViewIPDBillDialog} onOpenChange={setShowViewIPDBillDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>IPD Bill Details</DialogTitle>
                <DialogDescription>
                  {selectedIPDBill && `Bill ID: ${selectedIPDBill.billNumber || selectedIPDBill.id.slice(0, 8)}`}
                </DialogDescription>
              </DialogHeader>
              
              {selectedIPDBill && (
                <div className="space-y-6" id="ipd-bill-print-content">
                  {/* Bill Header */}
                  <div className="border-b pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Name:</span> {selectedIPDBill.admission?.patient?.firstName} {selectedIPDBill.admission?.patient?.lastName}</p>
                          <p><span className="font-medium">Patient ID:</span> {selectedIPDBill.admission?.patient?.patientId}</p>
                          <p><span className="font-medium">Phone:</span> {selectedIPDBill.admission?.patient?.phone || 'N/A'}</p>
                          <p><span className="font-medium">Age/Gender:</span> {selectedIPDBill.admission?.patient?.age || 'N/A'} / {selectedIPDBill.admission?.patient?.gender || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Admission Information</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Admission ID:</span> {selectedIPDBill.admission?.admissionId || selectedIPDBill.admissionId.slice(0, 8)}</p>
                          <p><span className="font-medium">Admission Date:</span> {selectedIPDBill.admission?.admissionTime ? new Date(selectedIPDBill.admission.admissionTime).toLocaleDateString() : 'N/A'}</p>
                          <p><span className="font-medium">Ward/Bed:</span> {selectedIPDBill.admission?.bed?.ward?.name || 'N/A'} - {selectedIPDBill.admission?.bed?.bedNumber || 'N/A'}</p>
                          <p><span className="font-medium">Attending Doctor:</span> {selectedIPDBill.admission?.doctor?.firstName || 'N/A'} {selectedIPDBill.admission?.doctor?.lastName || ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bill Charges Breakdown */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Bill Breakdown</h3>
                    
                    {isEditMode ? (
                      // Edit Mode - Show Input Fields
                      <div className="space-y-4 border rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Bed Charges</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editBillForm.bedCharges || ""}
                              onChange={e => setEditBillForm({ ...editBillForm, bedCharges: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label>Room Charges</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editBillForm.roomCharges || ""}
                              onChange={e => setEditBillForm({ ...editBillForm, roomCharges: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label>ICU Charges</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editBillForm.icuCharges || ""}
                              onChange={e => setEditBillForm({ ...editBillForm, icuCharges: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label>Nursing Charges</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editBillForm.nursingCharges || ""}
                              onChange={e => setEditBillForm({ ...editBillForm, nursingCharges: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label>Doctor Fees</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editBillForm.doctorFees || ""}
                              onChange={e => setEditBillForm({ ...editBillForm, doctorFees: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Edit Additional Charges */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="font-semibold">Additional Charges</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditBillForm({
                                  ...editBillForm,
                                  additionalChargesList: [
                                    ...editBillForm.additionalChargesList,
                                    { heading: "", amount: 0 }
                                  ]
                                })
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          
                          {editBillForm.additionalChargesList.map((charge, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end">
                              <div className="col-span-6">
                                <Input
                                  placeholder="Charge description"
                                  value={charge.heading}
                                  onChange={e => {
                                    const updated = [...editBillForm.additionalChargesList]
                                    updated[index].heading = e.target.value
                                    setEditBillForm({ ...editBillForm, additionalChargesList: updated })
                                  }}
                                />
                              </div>
                              <div className="col-span-4">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  min="0"
                                  step="0.01"
                                  value={charge.amount || ""}
                                  onChange={e => {
                                    const updated = [...editBillForm.additionalChargesList]
                                    updated[index].amount = parseFloat(e.target.value) || 0
                                    setEditBillForm({ ...editBillForm, additionalChargesList: updated })
                                  }}
                                />
                              </div>
                              <div className="col-span-2">
                                {editBillForm.additionalChargesList.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updated = editBillForm.additionalChargesList.filter((_, i) => i !== index)
                                      setEditBillForm({ ...editBillForm, additionalChargesList: updated })
                                    }}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Separator />
                        
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total Amount:</span>
                            <span>₹{(
                              editBillForm.bedCharges + 
                              editBillForm.roomCharges + 
                              editBillForm.icuCharges +
                              editBillForm.nursingCharges +
                              editBillForm.doctorFees +
                              editBillForm.additionalChargesList.reduce((sum, c) => sum + (c.amount || 0), 0)
                            ).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode - Show Table
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {selectedIPDBill.roomCharges > 0 && (
                              <tr>
                                <td className="px-4 py-3 text-sm">Room Charges</td>
                                <td className="px-4 py-3 text-sm text-right">₹{selectedIPDBill.roomCharges.toLocaleString()}</td>
                              </tr>
                            )}
                            {selectedIPDBill.doctorFees > 0 && (
                              <tr>
                                <td className="px-4 py-3 text-sm">Doctor Fees</td>
                                <td className="px-4 py-3 text-sm text-right">₹{selectedIPDBill.doctorFees.toLocaleString()}</td>
                              </tr>
                            )}
                            {selectedIPDBill.nursingCharges > 0 && (
                              <tr>
                                <td className="px-4 py-3 text-sm">Nursing Charges</td>
                                <td className="px-4 py-3 text-sm text-right">₹{selectedIPDBill.nursingCharges.toLocaleString()}</td>
                              </tr>
                            )}
                            {selectedIPDBill.medicineCharges > 0 && (
                              <tr>
                                <td className="px-4 py-3 text-sm">Medicine Charges</td>
                                <td className="px-4 py-3 text-sm text-right">₹{selectedIPDBill.medicineCharges.toLocaleString()}</td>
                              </tr>
                            )}
                            {selectedIPDBill.labCharges > 0 && (
                              <tr>
                                <td className="px-4 py-3 text-sm">Lab Charges</td>
                                <td className="px-4 py-3 text-sm text-right">₹{selectedIPDBill.labCharges.toLocaleString()}</td>
                              </tr>
                            )}
                            {selectedIPDBill.otCharges > 0 && (
                              <tr>
                                <td className="px-4 py-3 text-sm">Operation Theatre Charges</td>
                                <td className="px-4 py-3 text-sm text-right">₹{selectedIPDBill.otCharges.toLocaleString()}</td>
                              </tr>
                            )}
                            {selectedIPDBill.miscCharges > 0 && (
                              <tr>
                                <td className="px-4 py-3 text-sm">Miscellaneous Charges</td>
                                <td className="px-4 py-3 text-sm text-right">₹{selectedIPDBill.miscCharges.toLocaleString()}</td>
                              </tr>
                            )}
                            {/* Additional Charges Section */}
                            {selectedIPDBill.notes && (() => {
                              try {
                                const additionalChargesList = JSON.parse(selectedIPDBill.notes.includes('[{') ? selectedIPDBill.notes : '[]')
                                if (Array.isArray(additionalChargesList) && additionalChargesList.length > 0) {
                                  return (
                                    <>
                                      <tr className="bg-purple-50">
                                        <td colSpan={2} className="px-4 py-2 text-sm font-semibold text-purple-900">
                                          Additional Charges
                                        </td>
                                      </tr>
                                      {additionalChargesList.map((charge: any, idx: number) => (
                                        <tr key={idx} className="bg-purple-25">
                                          <td className="px-4 py-2 text-sm pl-8 text-purple-800">{charge.heading}</td>
                                          <td className="px-4 py-2 text-sm text-right text-purple-800">₹{(charge.amount || 0).toLocaleString()}</td>
                                        </tr>
                                      ))}
                                    </>
                                  )
                                }
                              } catch (e) {
                                return null
                              }
                              return null
                            })()}
                            <tr className="bg-gray-50 font-semibold">
                              <td className="px-4 py-3 text-sm">Total Amount</td>
                              <td className="px-4 py-3 text-sm text-right">₹{(selectedIPDBill.totalAmount || 0).toLocaleString()}</td>
                            </tr>
                            {selectedIPDBill.discount > 0 && (
                              <tr className="text-green-600">
                                <td className="px-4 py-3 text-sm">Discount</td>
                                <td className="px-4 py-3 text-sm text-right">- ₹{selectedIPDBill.discount.toLocaleString()}</td>
                              </tr>
                            )}
                            <tr className="bg-blue-50 font-bold text-lg">
                              <td className="px-4 py-3">Net Amount</td>
                              <td className="px-4 py-3 text-right">₹{((selectedIPDBill.totalAmount || 0) - (selectedIPDBill.discount || 0)).toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Paid Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">₹{(selectedIPDBill.paidAmount || 0).toLocaleString()}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Balance Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-red-600">₹{(selectedIPDBill.balanceAmount || 0).toLocaleString()}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="pt-1">{getStatusBadge(selectedIPDBill.paymentStatus)}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Payment History (if available) */}
                  {selectedIPDBill.payments && selectedIPDBill.payments.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Payment History</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Amount</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Method</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Transaction ID</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {selectedIPDBill.payments.map((payment: any, idx: number) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm">₹{payment.amount.toLocaleString()}</td>
                                <td className="px-4 py-2 text-sm">{payment.paymentMethod}</td>
                                <td className="px-4 py-2 text-sm">{payment.transactionId || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                  {!isEditMode ? (
                    <>
                      <Button variant="outline" onClick={() => setShowViewIPDBillDialog(false)}>
                        Close
                      </Button>
                      {selectedIPDBill && selectedIPDBill.paymentStatus !== 'COMPLETED' && (
                        <Button variant="outline" onClick={() => handleEditIPDBill(selectedIPDBill)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Bill
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsEditMode(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveIPDBill}>
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
                {!isEditMode && (
                  <div className="flex gap-2">
                    {selectedIPDBill && selectedIPDBill.paymentStatus !== 'COMPLETED' && (
                      <Button onClick={() => {
                        setShowViewIPDBillDialog(false)
                        openIPDPaymentDialog(selectedIPDBill)
                      }}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Record Payment
                      </Button>
                    )}
                    <Button onClick={handlePrintIPDBill}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print Bill
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* IPD Payment Recording Dialog */}
          <Dialog open={showIPDPaymentDialog} onOpenChange={setShowIPDPaymentDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record IPD Payment</DialogTitle>
                <DialogDescription>
                  {selectedIPDBillForPayment && (
                    <div className="space-y-2 mt-2">
                      <div>Patient: {`${selectedIPDBillForPayment.admission?.patient?.firstName} ${selectedIPDBillForPayment.admission?.patient?.lastName}`}</div>
                      <div>Bill ID: {selectedIPDBillForPayment.id.slice(0, 8)}...</div>
                      <div>Total Amount: ₹{selectedIPDBillForPayment.totalAmount?.toLocaleString()}</div>
                      <div>Paid Amount: ₹{selectedIPDBillForPayment.paidAmount?.toLocaleString()}</div>
                      <div className="font-medium">Balance Amount: ₹{selectedIPDBillForPayment.balanceAmount?.toLocaleString()}</div>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Payment Amount *</Label>
                  <Input
                    type="number"
                    placeholder="Enter payment amount"
                    value={ipdPaymentForm.amount}
                    onChange={e => setIpdPaymentForm({ ...ipdPaymentForm, amount: parseFloat(e.target.value) || 0 })}
                    max={selectedIPDBillForPayment?.balanceAmount || 0}
                  />
                </div>
                <div>
                  <Label>Payment Method *</Label>
                  <Select
                    value={ipdPaymentForm.paymentMethod}
                    onValueChange={(value: typeof ipdPaymentForm.paymentMethod) => setIpdPaymentForm({ ...ipdPaymentForm, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                      <SelectItem value="ONLINE">Online Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(ipdPaymentForm.paymentMethod === 'CARD' || ipdPaymentForm.paymentMethod === 'UPI' || ipdPaymentForm.paymentMethod === 'ONLINE') && (
                  <div>
                    <Label>Transaction ID</Label>
                    <Input
                      placeholder="Enter transaction ID"
                      value={ipdPaymentForm.transactionId}
                      onChange={e => setIpdPaymentForm({ ...ipdPaymentForm, transactionId: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any notes about this payment"
                    value={ipdPaymentForm.notes}
                    onChange={e => setIpdPaymentForm({ ...ipdPaymentForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowIPDPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRecordIPDPayment}
                  disabled={ipdBillingLoading || ipdPaymentForm.amount <= 0 || ipdPaymentForm.amount > (selectedIPDBillForPayment?.balanceAmount || 0)}
                >
                  {ipdBillingLoading ? "Processing..." : "Record Payment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
