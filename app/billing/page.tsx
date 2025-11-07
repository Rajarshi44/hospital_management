"use client"

import { useState, useMemo, useRef } from "react"
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
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { BillPrintLayout } from "@/components/billing/bill-print-layout"

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
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [showOPDDialog, setShowOPDDialog] = useState(false)
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showNewClaimDialog, setShowNewClaimDialog] = useState(false)
  const [dateFilter, setDateFilter] = useState("today")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [paymentModeFilter, setPaymentModeFilter] = useState("all")
  
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
    if (typeof window !== "undefined") {
      window.print()
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

  const updateLineItem = (
    categoryId: string,
    itemId: string,
    field: keyof BillingLineItem,
    value: any
  ) => {
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
      (total, category) =>
        total + category.items.reduce((catTotal, item) => catTotal + item.amount, 0),
      0
    )
  }

  const calculateTotalDiscount = () => {
    return billingCategories.reduce(
      (total, category) =>
        total + category.items.reduce((catTotal, item) => catTotal + item.discount, 0),
      0
    )
  }

  const total = calculateTotal()
  const totalDiscount = calculateTotalDiscount()
  const subtotal = total
  const serviceCharge = subtotal * 0.15
  const billAmount = subtotal + serviceCharge

  const handleCreateOPDBill = () => {
    toast({
      title: "OPD Bill Created",
      description: "Bill has been created successfully",
    })
    // Don't close the dialog, user can choose to print or close
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
            <div className="flex gap-2">
              <Button onClick={() => setShowOPDDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New OPD Bill
              </Button>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="opd">OPD Billing</TabsTrigger>
              <TabsTrigger value="ipd">IPD Billing</TabsTrigger>
              <TabsTrigger value="insurance">Insurance/TPA</TabsTrigger>
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
                      const widthClass = item.percentage >= 50 ? 'w-1/2' : item.percentage >= 30 ? 'w-1/3' : item.percentage >= 10 ? 'w-1/6' : 'w-1/12';
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
                      );
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
                        <Input placeholder="Search bills..." className="pl-10 w-64" />
                      </div>
                      <Button onClick={() => setShowOPDDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Bill
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill ID</TableHead>
                        <TableHead>Patient UHID</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockOPDBills.map(bill => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-mono">{bill.id}</TableCell>
                          <TableCell>{bill.patientUhid}</TableCell>
                          <TableCell className="font-medium">{bill.patientName}</TableCell>
                          <TableCell>{bill.doctor}</TableCell>
                          <TableCell className="font-medium">₹{bill.amount.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(bill.status)}</TableCell>
                          <TableCell>{bill.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* IPD Billing Tab */}
            <TabsContent value="ipd" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>IPD Billing (Real-time)</CardTitle>
                      <CardDescription>Track running bills and manage inpatient billing</CardDescription>
                    </div>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Bills
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill ID</TableHead>
                        <TableHead>Admission ID</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Bed Days</TableHead>
                        <TableHead>Running Total</TableHead>
                        <TableHead>TPA Status</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockIPDBills.map(bill => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-mono">{bill.id}</TableCell>
                          <TableCell>{bill.admissionId}</TableCell>
                          <TableCell className="font-medium">{bill.patientName}</TableCell>
                          <TableCell>{bill.bedDays}</TableCell>
                          <TableCell className="font-medium">₹{bill.runningTotal.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(bill.tpaStatus)}</TableCell>
                          <TableCell>{getStatusBadge(bill.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance/TPA Tab */}
            <TabsContent value="insurance" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Insurance & TPA Claims</CardTitle>
                      <CardDescription>Manage insurance claims and TPA authorizations</CardDescription>
                    </div>
                    <Button onClick={() => setShowNewClaimDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Claim
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Claim ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>TPA</TableHead>
                        <TableHead>Policy No</TableHead>
                        <TableHead>Claimed Amount</TableHead>
                        <TableHead>Approved Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTPAClaims.map(claim => (
                        <TableRow key={claim.claimId}>
                          <TableCell className="font-mono">{claim.claimId}</TableCell>
                          <TableCell className="font-medium">{claim.patient}</TableCell>
                          <TableCell>{claim.tpa}</TableCell>
                          <TableCell>{claim.policyNo}</TableCell>
                          <TableCell>₹{claim.claimedAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            {claim.approvedAmount > 0 ? `₹${claim.approvedAmount.toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Claim
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Documents
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
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
            <DialogContent className="max-w-[98vw] w-full h-[98vh] max-h-[98vh] overflow-y-auto p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create OPD Bill</DialogTitle>
                <DialogDescription className="text-base">Generate new outpatient billing invoice</DialogDescription>
              </DialogHeader>
              
              {/* Patient Information */}
              <div className="space-y-4">
                <div className="text-sm font-semibold">Patient Information</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Patient Name *</Label>
                    <Input
                      placeholder="Enter patient name"
                      value={patientInfo.name}
                      onChange={e => setPatientInfo({ ...patientInfo, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Registration No. (UHID) *</Label>
                    <Input
                      placeholder="Search or enter UHID"
                      value={patientInfo.uhid}
                      onChange={e => setPatientInfo({ ...patientInfo, uhid: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Age *</Label>
                    <Input
                      type="number"
                      placeholder="Age"
                      value={patientInfo.age}
                      onChange={e => setPatientInfo({ ...patientInfo, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select
                      value={patientInfo.gender}
                      onValueChange={value => setPatientInfo({ ...patientInfo, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>PAN No.</Label>
                    <Input
                      placeholder="PAN number (optional)"
                      value={patientInfo.pan}
                      onChange={e => setPatientInfo({ ...patientInfo, pan: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>CIN No.</Label>
                    <Input
                      placeholder="CIN number (optional)"
                      value={patientInfo.cin}
                      onChange={e => setPatientInfo({ ...patientInfo, cin: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea
                    placeholder="Patient address"
                    rows={2}
                    value={patientInfo.address}
                    onChange={e => setPatientInfo({ ...patientInfo, address: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              {/* Visit Details */}
              <div className="space-y-4">
                <div className="text-sm font-semibold">Visit Details</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Admission/Visit Date *</Label>
                    <Input
                      type="datetime-local"
                      value={visitInfo.admissionDate}
                      onChange={e => setVisitInfo({ ...visitInfo, admissionDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Discharge Date</Label>
                    <Input
                      type="datetime-local"
                      value={visitInfo.dischargeDate}
                      onChange={e => setVisitInfo({ ...visitInfo, dischargeDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Doctor In Charge *</Label>
                    <Input
                      placeholder="Search doctor..."
                      value={visitInfo.doctor}
                      onChange={e => setVisitInfo({ ...visitInfo, doctor: e.target.value })}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>Case/Diagnosis *</Label>
                    <Input
                      placeholder="e.g., KNEE JOINT PAIN"
                      value={visitInfo.diagnosis}
                      onChange={e => setVisitInfo({ ...visitInfo, diagnosis: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Billing Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Billing Details</div>
                  <Button variant="outline" size="sm" onClick={() => setShowAddCategoryDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
                
                {/* Dynamic Categories */}
                {billingCategories.map((category, categoryIndex) => (
                  <div key={category.id} className="space-y-2 border rounded-lg p-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-muted-foreground">{category.name}</div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addLineItem(category.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Item
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(category.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Line Items */}
                    {category.items.map((item, itemIndex) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          {itemIndex === 0 && <Label className="text-xs">Description</Label>}
                          <Input
                            placeholder="e.g., Item description"
                            value={item.description}
                            onChange={e =>
                              updateLineItem(category.id, item.id, "description", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          {itemIndex === 0 && <Label className="text-xs">Type</Label>}
                          <Select
                            value={item.type}
                            onValueChange={value =>
                              updateLineItem(category.id, item.id, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="unit">Unit</SelectItem>
                              <SelectItem value="hour">Hour</SelectItem>
                              <SelectItem value="hr">Hr.</SelectItem>
                              <SelectItem value="case">Case</SelectItem>
                              <SelectItem value="surgery">Surgery</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                              <SelectItem value="lumpsum">Lumpsum</SelectItem>
                              <SelectItem value="set">Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          {itemIndex === 0 && <Label className="text-xs">Rate</Label>}
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={item.rate || ""}
                            onChange={e =>
                              updateLineItem(category.id, item.id, "rate", parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          {itemIndex === 0 && <Label className="text-xs">Discount</Label>}
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={item.discount || ""}
                            onChange={e =>
                              updateLineItem(
                                category.id,
                                item.id,
                                "discount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="col-span-1">
                          {itemIndex === 0 && <Label className="text-xs">Amount</Label>}
                          <Input
                            type="number"
                            value={item.amount.toFixed(2)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="col-span-1 flex items-center">
                          {itemIndex === 0 && <div className="h-5" />}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(category.id, item.id)}
                            disabled={category.items.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Bill Summary */}
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Discount:</span>
                  <span className="font-medium text-green-600">₹{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Charge (15.00%):</span>
                  <span className="font-medium">₹{serviceCharge.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Bill Amount:</span>
                  <span className="font-semibold">₹{billAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Paid Amount:</span>
                  <span>₹{billAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <div className="text-sm font-semibold">Payment Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Mode</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="insurance">Insurance/TPA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Transaction Reference</Label>
                    <Input placeholder="Reference number (optional)" />
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
                <Button onClick={handleCreateOPDBill}>Generate Bill</Button>
              </DialogFooter>
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
                  <Select
                    value={claimInfo.tpa}
                    onValueChange={value => setClaimInfo({ ...claimInfo, tpa: value })}
                  >
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
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
