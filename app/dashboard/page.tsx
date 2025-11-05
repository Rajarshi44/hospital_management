"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  UserCheck,
  Activity,
  FileText,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  Bed,
  RefreshCw,
  TestTube,
  Stethoscope,
  IndianRupee,
  BellRing,
  Building2,
  Siren,
  Heart,
  CreditCard,
  Zap,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { mockAdmissions, mockWards, mockBeds, getDaysAdmitted } from "@/lib/ipd-mock-data"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Mock additional data for enhanced dashboard
const mockDoctorsOnDuty = [
  { id: "1", name: "Dr. Sarah Johnson", speciality: "Cardiology", shift: "Morning", status: "active" },
  { id: "2", name: "Dr. Michael Chen", speciality: "Neurology", shift: "Morning", status: "active" },
  { id: "3", name: "Dr. Emily Brown", speciality: "General Medicine", shift: "Evening", status: "upcoming" },
]

const mockPendingDiagnostics = {
  lab: [
    { patient: "John Smith", test: "Complete Blood Count", waitTime: "45 min" },
    { patient: "Maria Garcia", test: "Liver Function Test", waitTime: "1.2 hrs" },
  ],
  radiology: [{ patient: "Robert Johnson", test: "Chest X-Ray", waitTime: "30 min" }],
  scan: [{ patient: "David Brown", test: "CT Scan", waitTime: "2 hrs" }],
}

const mockBillingData = {
  totalDue: 245000,
  lowAdvanceCount: 5,
  avgDaily: 8500,
  depositShortfall: 3,
}

const mockActivityFeed = [
  { id: "1", type: "admission", patient: "Alice Johnson", time: "2 hours ago", ward: "ICU Ward" },
  { id: "2", type: "discharge", patient: "Tom Wilson", time: "3 hours ago", ward: "General Ward A" },
  { id: "3", type: "transfer", patient: "Emma Davis", time: "4 hours ago", from: "General", to: "Private" },
  { id: "4", type: "admission", patient: "James Miller", time: "5 hours ago", ward: "General Ward B" },
]

const mockAlerts = [
  { id: "1", message: "Low bed availability in ICU", priority: "high", time: "10 min ago" },
  { id: "2", message: "5 patients require deposit top-up", priority: "medium", time: "1 hour ago" },
  { id: "3", message: "Ventilator maintenance due", priority: "low", time: "3 hours ago" },
]

export default function DashboardPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Calculate dashboard stats
  const totalAdmissions = mockAdmissions.filter(a => a.status !== "discharged").length
  const criticalPatients = mockAdmissions.filter(a => a.status === "critical").length
  const dischargeReady = mockAdmissions.filter(
    a => a.status === "stable" && getDaysAdmitted(a.admissionDate) >= 2
  ).length
  const newAdmissionsToday = mockAdmissions.filter(
    a => new Date(a.admissionDate).toDateString() === new Date().toDateString()
  ).length

  // Bed occupancy data
  const totalBeds = mockBeds.length
  const occupiedBeds = mockBeds.filter(b => b.isOccupied).length
  const availableBeds = totalBeds - occupiedBeds
  const icuBeds = mockBeds.filter(b => b.type === "icu")
  const icuOccupied = icuBeds.filter(b => b.isOccupied).length

  const bedOccupancyData = [
    { name: "Occupied", value: occupiedBeds, color: "#3b82f6" },
    { name: "Available", value: availableBeds, color: "#10b981" },
  ]

  // Inpatient load by type
  const icuCount = mockAdmissions.filter(a => a.wardName.includes("ICU") && a.status !== "discharged").length
  const generalCount = mockAdmissions.filter(a => a.wardName.includes("General") && a.status !== "discharged").length
  const privateCount = mockAdmissions.filter(a => a.wardName.includes("Private") && a.status !== "discharged").length
  const ventilatorCount = 2

  const recentAdmissions = mockAdmissions
    .filter(a => a.status !== "discharged")
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 5)

  const handleRefresh = () => {
    setLastRefresh(new Date())
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "admission":
        return <UserCheck className="h-4 w-4 text-blue-600" />
      case "discharge":
        return <FileText className="h-4 w-4 text-green-600" />
      case "transfer":
        return <Activity className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "low":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Modern Header with Gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
                  <p className="text-blue-100 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRefresh}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalAdmissions}</div>
                      <div className="text-xs text-blue-100">Active Patients</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Stats Cards with Gradient Backgrounds */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-2">Active Admissions</p>
                    <p className="text-4xl font-bold text-blue-900">{totalAdmissions}</p>
                    <p className="text-xs text-blue-600 mt-2">Total inpatients</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-2">Critical Cases</p>
                    <p className="text-4xl font-bold text-red-900">{criticalPatients}</p>
                    <p className="text-xs text-red-600 mt-2">Need attention</p>
                  </div>
                  <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-2">Ready to Discharge</p>
                    <p className="text-4xl font-bold text-green-900">{dischargeReady}</p>
                    <p className="text-xs text-green-600 mt-2">Stable patients</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-2">Today's Admissions</p>
                    <p className="text-4xl font-bold text-purple-900">{newAdmissionsToday}</p>
                    <p className="text-xs text-purple-600 mt-2">New today</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Simplified Dashboard Content */}
          <div className="grid grid-cols-1 gap-6">
            {/* Ward Summary - Simple Grid */}
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="text-lg">Ward Summary</CardTitle>
                <CardDescription className="text-gray-600">Current patient distribution</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 text-center">
                    <div className="text-3xl font-bold text-blue-600">{icuCount}</div>
                    <p className="text-sm text-gray-600 mt-1">ICU</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 text-center">
                    <div className="text-3xl font-bold text-green-600">{generalCount}</div>
                    <p className="text-sm text-gray-600 mt-1">General</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 text-center">
                    <div className="text-3xl font-bold text-purple-600">{privateCount}</div>
                    <p className="text-sm text-gray-600 mt-1">Private</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 text-center">
                    <div className="text-3xl font-bold text-red-600">{ventilatorCount}</div>
                    <p className="text-sm text-gray-600 mt-1">Ventilator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-600">Frequently used IPD operations</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link href="/ipd/admission">
                  <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                    <UserCheck className="h-7 w-7" />
                    <span className="text-sm font-medium">New Admission</span>
                  </Button>
                </Link>
                <Link href="/ipd/inpatient">
                  <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all text-white">
                    <Activity className="h-7 w-7" />
                    <span className="text-sm font-medium">Manage Inpatients</span>
                  </Button>
                </Link>
                <Link href="/wards">
                  <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-white">
                    <Bed className="h-7 w-7" />
                    <span className="text-sm font-medium">Ward/Bed Status</span>
                  </Button>
                </Link>
                <Link href="/ipd/discharge">
                  <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all text-white">
                    <FileText className="h-7 w-7" />
                    <span className="text-sm font-medium">Discharge</span>
                  </Button>
                </Link>
                <Link href="/billing">
                  <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all text-white">
                    <IndianRupee className="h-7 w-7" />
                    <span className="text-sm font-medium">Billing Dashboard</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Admissions - Simplified */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
              <CardTitle className="text-lg">Recent Admissions</CardTitle>
              <CardDescription className="text-gray-600">Latest patient admissions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentAdmissions.map(admission => (
                  <div key={admission.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{admission.patientName}</h3>
                      <Badge variant="secondary">{admission.uhid}</Badge>
                      <Badge variant={admission.status === "critical" ? "destructive" : "default"}>
                        {admission.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {admission.wardName} - Bed {admission.bedNumber} • {getDaysAdmitted(admission.admissionDate)} days
                    </p>
                  </div>
                ))}
              </div>

              {recentAdmissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent admissions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
