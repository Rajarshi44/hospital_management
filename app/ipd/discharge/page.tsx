"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Download, UserCheck, Clock, AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { IPDService } from "@/lib/ipd-service"
import { useToast } from "@/hooks/use-toast"
import { format, differenceInDays } from "date-fns"

interface DischargedPatient {
  id: string
  admission: {
    id: string
    admissionId: string
    patient: {
      id: string
      firstName: string
      lastName: string
      phone: string
      gender: string
      dateOfBirth: string
      bloodGroup?: string
    }
    doctor: {
      id: string
      firstName: string
      lastName: string
      primaryDepartment?: {
        id: string
        name: string
      }
    }
    bed: {
      id: string
      bedNumber: string
      ward: {
        id: string
        name: string
        type: string
      }
    }
    admissionDate: string
    status: string
  }
  dischargeDate: string
  finalDiagnosis: string
  treatmentSummary?: string
  followUpInstructions?: string
  doctor: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function DischargePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [discharges, setDischarges] = useState<DischargedPatient[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch discharges and stats in parallel
      const [dischargesRes, statsRes] = await Promise.allSettled([
        IPDService.getDischarges({ limit: 100 }),
        IPDService.getDashboardStats()
      ])

      if (dischargesRes.status === 'fulfilled') {
        const response = dischargesRes.value as any
        // The backend returns {discharges: [...]} structure
        const dischargeData = response.discharges || response.data || response || []
        // Ensure we have an array
        setDischarges(Array.isArray(dischargeData) ? dischargeData : [])
      } else {
        console.error('Failed to fetch discharges:', dischargesRes.reason)
        setDischarges([])
      }

      if (statsRes.status === 'fulfilled') {
        const response = statsRes.value as any
        setDashboardStats(response.summary || response)
      } else {
        console.error('Failed to fetch stats:', statsRes.reason)
        setDashboardStats(null)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load discharge data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getDaysAdmitted = (admissionDate: string, dischargeDate: string) => {
    return differenceInDays(new Date(dischargeDate), new Date(admissionDate))
  }

  // Export discharge reports to Excel
  const exportToExcel = () => {
    const headers = ["Patient Name", "Admission ID", "Ward", "Bed Number", "Admission Date", "Discharge Date", "Days Stay", "Final Diagnosis", "Discharging Doctor"]
    
    const csvRows = [
      headers.join(","),
      ...discharges.map(discharge => {
        const days = getDaysAdmitted(discharge.admission.admissionDate, discharge.dischargeDate)
        return [
          `"${discharge.admission.patient.firstName} ${discharge.admission.patient.lastName}"`,
          discharge.admission.admissionId,
          `"${discharge.admission.bed.ward.name}"`,
          discharge.admission.bed.bedNumber,
          format(new Date(discharge.admission.admissionDate), 'yyyy-MM-dd'),
          format(new Date(discharge.dischargeDate), 'yyyy-MM-dd'),
          days,
          `"${discharge.finalDiagnosis}"`,
          `"Dr. ${discharge.doctor.firstName} ${discharge.doctor.lastName}"`
        ].join(",")
      })
    ]

    const csvContent = csvRows.join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `discharge-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = "hidden"
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToCsv = () => {
    const csvHeaders = [
      "Patient Name",
      "UHID", 
      "Admission Date",
      "Discharge Date",
      "Stay Duration (Days)",
      "Ward",
      "Bed",
      "Doctor",
      "Final Diagnosis",
      "Treatment Summary"
    ]

    const csvRows = [
      csvHeaders.join(","),
      ...filteredDischarges.map(discharge => {
        const patient = discharge.admission.patient
        const doctor = discharge.admission.doctor
        const bed = discharge.admission.bed
        const admissionDate = new Date(discharge.admission.admissionDate)
        const dischargeDate = new Date(discharge.dischargeDate)
        const stayDays = Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24))

        return [
          `"${patient.firstName} ${patient.lastName}"`,
          patient.id.slice(-6).toUpperCase(),
          format(admissionDate, 'yyyy-MM-dd'),
          format(dischargeDate, 'yyyy-MM-dd HH:mm'),
          stayDays,
          `"${bed.ward.name}"`,
          bed.bedNumber,
          `"Dr. ${doctor.firstName} ${doctor.lastName}"`,
          `"${discharge.finalDiagnosis}"`,
          `"${discharge.treatmentSummary || 'N/A'}"`
        ].join(",")
      })
    ]

    const csvContent = csvRows.join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `discharge-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = "hidden"
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredDischarges = (Array.isArray(discharges) ? discharges : []).filter((discharge: DischargedPatient) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    const patientName = `${discharge.admission?.patient?.firstName || ''} ${discharge.admission?.patient?.lastName || ''}`
    return (
      patientName.toLowerCase().includes(query) ||
      discharge.admission?.admissionId?.toLowerCase().includes(query) ||
      discharge.admission?.patient?.phone?.includes(query)
    )
  })

  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Discharge Records</h1>
              <p className="text-muted-foreground">View discharge history and generate reports</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={fetchAllData} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => router.push("/ipd")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Discharges</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? "..." : (Array.isArray(discharges) ? discharges : []).length}
                </div>
                <p className="text-xs text-muted-foreground">All time discharges</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Discharges</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : (Array.isArray(discharges) ? discharges : []).filter(d => 
                    format(new Date(d.dischargeDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">Completed today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month's Discharges</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : (Array.isArray(discharges) ? discharges : []).filter(d => {
                    const monthStart = new Date()
                    monthStart.setDate(1)
                    monthStart.setHours(0, 0, 0, 0)
                    return new Date(d.dischargeDate) >= monthStart
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Stay Duration</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : (() => {
                    const safeDischarges = Array.isArray(discharges) ? discharges : []
                    if (safeDischarges.length === 0) return "0"
                    const totalDays = safeDischarges.reduce((sum, d) => {
                      const admission = d.admission
                      if (!admission) return sum
                      const start = new Date(admission.admissionDate)
                      const end = new Date(d.dischargeDate)
                      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                      return sum + days
                    }, 0)
                    return (totalDays / safeDischarges.length).toFixed(1)
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">Days per patient</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Discharged Patients
              </CardTitle>
              <CardDescription>Find discharged patients by name, admission ID, or UHID</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, discharge ID, or UHID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={exportToCsv} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Discharged Patients ({filteredDischarges.length})
              </CardTitle>
              <CardDescription>View discharge records and summaries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="mx-auto h-12 w-12 text-muted-foreground/50 animate-spin" />
                  <h3 className="mt-4 text-sm font-semibold">Loading discharge records...</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Please wait</p>
                </div>
              ) : filteredDischarges.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-sm font-semibold">No discharge records found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search criteria."
                      : "No patients have been discharged yet."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Patient Info</TableHead>
                        <TableHead>Admission Details</TableHead>
                        <TableHead>Discharge Info</TableHead>
                        <TableHead>Stay Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDischarges.map((discharge: DischargedPatient) => {
                        const patient = discharge.admission.patient
                        const doctor = discharge.admission.doctor
                        const bed = discharge.admission.bed
                        const admissionDate = new Date(discharge.admission.admissionDate)
                        const dischargeDate = new Date(discharge.dischargeDate)
                        const stayDays = Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24))

                        return (
                          <TableRow key={discharge.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                                <div className="text-xs text-muted-foreground">
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  UHID: {patient.id.slice(-6).toUpperCase()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{bed.ward.name}</div>
                                <Badge variant="outline" className="text-xs">
                                  Bed {bed.bedNumber}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  Admitted: {format(admissionDate, 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                  <UserCheck className="h-3 w-3" />
                                  Discharged
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {format(dischargeDate, 'MMM dd, yyyy HH:mm')}
                                </div>
                                {discharge.treatmentSummary && (
                                  <div className="text-xs text-muted-foreground line-clamp-2">
                                    {discharge.treatmentSummary.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{stayDays} days</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // View discharge summary
                                    router.push(`/ipd/discharge/${discharge.id}`)
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
