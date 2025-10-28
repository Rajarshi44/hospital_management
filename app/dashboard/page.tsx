"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UserCheck, Activity, FileText, Users, Clock, AlertTriangle, TrendingUp, Bed, RefreshCw, TestTube, Stethoscope, IndianRupee, BellRing, Building2, Siren, Heart, CreditCard } from "lucide-react"
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
  radiology: [
    { patient: "Robert Johnson", test: "Chest X-Ray", waitTime: "30 min" },
  ],
  scan: [
    { patient: "David Brown", test: "CT Scan", waitTime: "2 hrs" },
  ],
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
      case "admission": return <UserCheck className="h-4 w-4 text-blue-600" />
      case "discharge": return <FileText className="h-4 w-4 text-green-600" />
      case "transfer": return <Activity className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200"
      case "medium": return "bg-orange-100 text-orange-700 border-orange-200"
      case "low": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">IPD Management Dashboard</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                Comprehensive inpatient department management • Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {totalAdmissions} Active Patients
              </Badge>
            </div>
          </div>

          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Admissions</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAdmissions}</div>
                <p className="text-xs text-muted-foreground">Active inpatients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalPatients}</div>
                <p className="text-xs text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready for Discharge</CardTitle>
                <FileText className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dischargeReady}</div>
                <p className="text-xs text-muted-foreground">Patients stable for discharge</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Admissions</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newAdmissionsToday}</div>
                <p className="text-xs text-muted-foreground">New admissions today</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Bed Occupancy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    Bed Occupancy
                  </CardTitle>
                  <CardDescription>Current bed availability across all wards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bedOccupancyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {bedOccupancyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{totalBeds}</div>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{occupiedBeds}</div>
                      <p className="text-xs text-muted-foreground">Occupied</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{availableBeds}</div>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>ICU Occupancy:</span>
                      <span className="font-medium">{icuOccupied} / {icuBeds.length}</span>
                    </div>
                    <Progress value={(icuOccupied / icuBeds.length) * 100} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAlerts.map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.priority)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{alert.message}</p>
                            <p className="text-xs mt-1 opacity-75">{alert.time}</p>
                          </div>
                          <Badge variant="outline" className="ml-2">{alert.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Admission/Discharge Feed
                  </CardTitle>
                  <CardDescription>Recent activity (last 6 hours)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivityFeed.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="mt-1">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.patient}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.type === "transfer" 
                              ? `Transferred from ${activity.from} to ${activity.to}`
                              : `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • ${activity.ward}`
                            }
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Inpatient Load */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Inpatient Load
                  </CardTitle>
                  <CardDescription>Patient distribution by ward type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Siren className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">ICU</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{icuCount}</div>
                      <p className="text-xs text-muted-foreground">Patients</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">General</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{generalCount}</div>
                      <p className="text-xs text-muted-foreground">Patients</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Bed className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Private</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{privateCount}</div>
                      <p className="text-xs text-muted-foreground">Patients</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Ventilator</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{ventilatorCount}</div>
                      <p className="text-xs text-muted-foreground">Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Doctors On Duty */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Doctors On Duty
                  </CardTitle>
                  <CardDescription>Current shift doctors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockDoctorsOnDuty.map((doctor) => (
                      <div key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.speciality} • {doctor.shift} Shift</p>
                        </div>
                        <Badge variant={doctor.status === "active" ? "default" : "secondary"}>
                          {doctor.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Diagnostics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Pending Diagnostics
                  </CardTitle>
                  <CardDescription>Awaiting test results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Lab Tests</span>
                        <Badge variant="secondary">{mockPendingDiagnostics.lab.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {mockPendingDiagnostics.lab.map((item, i) => (
                          <div key={i} className="text-xs flex justify-between p-2 bg-muted rounded">
                            <span>{item.patient} - {item.test}</span>
                            <span className="text-muted-foreground">{item.waitTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Radiology</span>
                        <Badge variant="secondary">{mockPendingDiagnostics.radiology.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {mockPendingDiagnostics.radiology.map((item, i) => (
                          <div key={i} className="text-xs flex justify-between p-2 bg-muted rounded">
                            <span>{item.patient} - {item.test}</span>
                            <span className="text-muted-foreground">{item.waitTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Scans</span>
                        <Badge variant="secondary">{mockPendingDiagnostics.scan.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {mockPendingDiagnostics.scan.map((item, i) => (
                          <div key={i} className="text-xs flex justify-between p-2 bg-muted rounded">
                            <span>{item.patient} - {item.test}</span>
                            <span className="text-muted-foreground">{item.waitTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Deposits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <IndianRupee className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Total Due</span>
                      </div>
                      <div className="text-lg font-bold">₹{mockBillingData.totalDue.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-muted-foreground">Low Advance</span>
                      </div>
                      <div className="text-lg font-bold text-orange-600">{mockBillingData.lowAdvanceCount}</div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Avg Daily</span>
                      </div>
                      <div className="text-lg font-bold">₹{mockBillingData.avgDaily.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-muted-foreground">Shortfall</span>
                      </div>
                      <div className="text-lg font-bold text-red-600">{mockBillingData.depositShortfall}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used IPD operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link href="/admin/ipd/admission">
                  <Button className="w-full h-20 flex flex-col gap-2">
                    <UserCheck className="h-6 w-6" />
                    <span className="text-sm">New Admission</span>
                  </Button>
                </Link>
                <Link href="/admin/ipd/inpatient">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">Manage Inpatients</span>
                  </Button>
                </Link>
                <Link href="/wards">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Bed className="h-6 w-6" />
                    <span className="text-sm">Ward/Bed Status</span>
                  </Button>
                </Link>
                <Link href="/admin/ipd/discharge">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Discharge</span>
                  </Button>
                </Link>
                <Link href="/billing">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <IndianRupee className="h-6 w-6" />
                    <span className="text-sm">Billing Dashboard</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Admissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Admissions</CardTitle>
              <CardDescription>Latest patient admissions and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAdmissions.map(admission => (
                  <div key={admission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{admission.patientName}</h3>
                        <Badge variant="secondary">{admission.uhid}</Badge>
                        <Badge
                          variant={
                            admission.status === "critical"
                              ? "destructive"
                              : admission.status === "stable"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {admission.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {admission.wardName} - Bed {admission.bedNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {getDaysAdmitted(admission.admissionDate)} days
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="h-4 w-4" />
                          {admission.consultingDoctorName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/admin/ipd/inpatient">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {recentAdmissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No recent admissions</p>
                  <p className="text-sm">New admissions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
