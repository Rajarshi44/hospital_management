"use client"

import { useState, useMemo } from "react"
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
} from "lucide-react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

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
  { id: "OPD001", patientUhid: "PAT001", patientName: "John Doe", doctor: "Dr. Sarah Johnson", amount: 2500, status: "Paid", date: "2025-10-28" },
  { id: "OPD002", patientUhid: "PAT002", patientName: "Jane Smith", doctor: "Dr. Michael Chen", amount: 1800, status: "Pending", date: "2025-10-28" },
  { id: "OPD003", patientUhid: "PAT003", patientName: "Bob Wilson", doctor: "Dr. Emily Brown", amount: 3200, status: "Interim", date: "2025-10-27" },
]

const mockIPDBills = [
  { id: "IPD001", admissionId: "ADM001", patientName: "Alice Johnson", bedDays: 5, runningTotal: 45000, tpaStatus: "Approved", status: "Running" },
  { id: "IPD002", admissionId: "ADM002", patientName: "Robert Smith", bedDays: 3, runningTotal: 28000, tpaStatus: "Pending", status: "Running" },
  { id: "IPD003", admissionId: "ADM003", patientName: "Carol White", bedDays: 7, runningTotal: 65000, tpaStatus: "N/A", status: "Finalized" },
]

const mockTPAClaims = [
  { claimId: "CLM001", patient: "Alice Johnson", tpa: "Star Health", policyNo: "SH123456", claimedAmount: 45000, approvedAmount: 40000, status: "Approved" },
  { claimId: "CLM002", patient: "Robert Smith", tpa: "HDFC Ergo", policyNo: "HD789012", claimedAmount: 28000, approvedAmount: 0, status: "Pending" },
  { claimId: "CLM003", patient: "David Brown", tpa: "ICICI Lombard", policyNo: "IC345678", claimedAmount: 55000, approvedAmount: 0, status: "Rejected" },
]

const mockAdvancePayments = [
  { id: "ADV001", patientUhid: "PAT001", patientName: "John Doe", amount: 10000, mode: "Card", date: "2025-10-25", status: "Applied" },
  { id: "ADV002", patientUhid: "PAT004", patientName: "Emma Wilson", amount: 5000, mode: "Cash", date: "2025-10-27", status: "Pending" },
]

const mockLedgerTransactions = [
  { txnId: "TXN001", date: "2025-10-28 10:30", type: "Payment", patientUhid: "PAT001", amount: 2500, mode: "UPI", status: "Success", billId: "OPD001" },
  { txnId: "TXN002", date: "2025-10-28 11:15", type: "Refund", patientUhid: "PAT005", amount: 500, mode: "Cash", status: "Completed", billId: "OPD015" },
  { txnId: "TXN003", date: "2025-10-28 14:20", type: "Advance", patientUhid: "PAT004", amount: 5000, mode: "Cash", status: "Success", billId: "-" },
]

export default function BillingPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [showOPDDialog, setShowOPDDialog] = useState(false)
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [dateFilter, setDateFilter] = useState("today")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [paymentModeFilter, setPaymentModeFilter] = useState("all")

  const handleCreateOPDBill = () => {
    toast({
      title: "OPD Bill Created",
      description: "Bill has been created successfully",
    })
    setShowOPDDialog(false)
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
              <Button variant="outline" onClick={() => setShowAdvanceDialog(true)}>
                <Wallet className="h-4 w-4 mr-2" />
                Record Advance
              </Button>
              <Button onClick={() => setShowOPDDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New OPD Bill
              </Button>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="opd">OPD Billing</TabsTrigger>
              <TabsTrigger value="ipd">IPD Billing</TabsTrigger>
              <TabsTrigger value="insurance">Insurance/TPA</TabsTrigger>
              <TabsTrigger value="advance">Advances</TabsTrigger>
              <TabsTrigger value="settlement">Settlement</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
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
                    <div className="text-2xl font-bold">₹{mockDashboardStats.outstandingReceivables.toLocaleString()}</div>
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
                    {mockRevenueBySource.map((item) => (
                      <div key={item.source} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.source}</span>
                          <span className="text-muted-foreground">
                            ₹{item.amount.toLocaleString()} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
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
                      {mockOPDBills.map((bill) => (
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
                      {mockIPDBills.map((bill) => (
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
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Claim
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
                      {mockTPAClaims.map((claim) => (
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
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advance Payments Tab */}
            <TabsContent value="advance" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Advance Payments</CardTitle>
                      <CardDescription>Track and manage advance payments</CardDescription>
                    </div>
                    <Button onClick={() => setShowAdvanceDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Advance
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Advance ID</TableHead>
                        <TableHead>Patient UHID</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAdvancePayments.map((advance) => (
                        <TableRow key={advance.id}>
                          <TableCell className="font-mono">{advance.id}</TableCell>
                          <TableCell>{advance.patientUhid}</TableCell>
                          <TableCell className="font-medium">{advance.patientName}</TableCell>
                          <TableCell className="font-medium">₹{advance.amount.toLocaleString()}</TableCell>
                          <TableCell>{advance.mode}</TableCell>
                          <TableCell>{advance.date}</TableCell>
                          <TableCell>{getStatusBadge(advance.status)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setShowRefundDialog(true)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Final Settlement Tab */}
            <TabsContent value="settlement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Final Settlement</CardTitle>
                  <CardDescription>Process final bill settlements and discharge clearance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Final Settlement Processing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select an IPD admission to process final settlement
                    </p>
                    <Button>View Pending Settlements</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Ledger Tab */}
            <TabsContent value="ledger" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Payment Ledger & Audit</CardTitle>
                      <CardDescription>View all financial transactions and audit trail</CardDescription>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Txn ID</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Patient UHID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Linked Bill</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLedgerTransactions.map((txn) => (
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

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Revenue by Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Analyze revenue breakdown by department
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      TPA Claims Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Insurance claims status and reconciliation
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bed className="h-5 w-5" />
                      Bed Occupancy Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Revenue from bed occupancy charges
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Doctor Payouts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Calculate doctor commission and payouts
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Tax Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      GST and tax collection summary
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Operations Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Overall billing operations analytics
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* OPD Billing Dialog */}
          <Dialog open={showOPDDialog} onOpenChange={setShowOPDDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create OPD Bill</DialogTitle>
                <DialogDescription>Generate new outpatient billing invoice</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient UHID *</Label>
                  <Input placeholder="Search patient..." />
                </div>
                <div>
                  <Label>Visit Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First Visit</SelectItem>
                      <SelectItem value="followup">Follow-Up</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Doctor *</Label>
                  <Input placeholder="Select doctor..." />
                </div>
                <div>
                  <Label>Consultation Fee *</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label>Discount</Label>
                  <div className="flex gap-2">
                    <Select defaultValue="percent">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">%</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Procedures / Services</Label>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal:</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tax:</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Payable:</span>
                  <span>₹0.00</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowOPDDialog(false)}>
                  Cancel
                </Button>
                <Button variant="outline">Save Interim Bill</Button>
                <Button onClick={handleCreateOPDBill}>Collect Payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
