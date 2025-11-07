"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Bed,
  Filter,
  Search,
  Plus,
  Activity,
  FileText,
  ArrowUpDown,
  AlertTriangle,
  Check,
  ArrowLeft,
  Edit,
  RefreshCw,
  LogOut,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { VitalsForm, TreatmentForm, BedTransferForm, PatientDetailsModal } from "@/components/ipd"
import { StatusUpdateModal } from "@/components/ipd/status-update-modal"
import { DischargeModal } from "@/components/ipd/discharge-modal"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { IPDService } from "@/lib/ipd-service"
import { useToast } from "@/hooks/use-toast"
import { format, differenceInDays } from "date-fns"

interface AdmittedPatient {
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
    dailyRate: number
    ward: {
      id: string
      name: string
      type: string
    }
  }
  admissionDate: string
  admissionType: string
  status: string
  chiefComplaint: string
  provisionalDiagnosis: string
  depositAmount?: number
  createdAt: string
}

export default function InpatientListPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [wardFilter, setWardFilter] = useState("all")
  const [selectedAdmission, setSelectedAdmission] = useState<string | null>(null)
  const [admissions, setAdmissions] = useState<AdmittedPatient[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<AdmittedPatient | null>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDischargeModal, setShowDischargeModal] = useState(false)

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch admissions, doctors, wards and stats in parallel
      const [admissionsRes, doctorsRes, wardsRes, statsRes] = await Promise.allSettled([
        IPDService.getAdmissions({ status: 'ACTIVE', limit: 100 }),
        IPDService.getDoctors({ isActive: true }),
        IPDService.getWards({ isActive: true }),
        IPDService.getDashboardStats()
      ])

      if (admissionsRes.status === 'fulfilled') {
        const response = admissionsRes.value as any
        setAdmissions(response.data || response || [])
      }

      if (doctorsRes.status === 'fulfilled') {
        const response = doctorsRes.value as any
        setDoctors(response.data || response || [])
      }

      if (wardsRes.status === 'fulfilled') {
        const response = wardsRes.value as any
        setWards(response.data || response || [])
      }

      if (statsRes.status === 'fulfilled') {
        const response = statsRes.value as any
        setDashboardStats(response.summary || response)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getDaysAdmitted = (admissionDate: string) => {
    return differenceInDays(new Date(), new Date(admissionDate))
  }

  const filteredAdmissions = admissions.filter((admission: AdmittedPatient) => {
    const patientName = `${admission.patient.firstName} ${admission.patient.lastName}`
    const matchesSearch =
      !searchQuery ||
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.admissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.patient.phone.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || admission.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesDoctor = doctorFilter === "all" || admission.doctor.id === doctorFilter
    const matchesWard = wardFilter === "all" || admission.bed.ward.id === wardFilter

    return matchesSearch && matchesStatus && matchesDoctor && matchesWard
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive"
      case "stable":
        return "default"
      case "observation":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-3 w-3" />
      case "stable":
        return <Check className="h-3 w-3" />
      case "observation":
        return <Activity className="h-3 w-3" />
      default:
        return null
    }
  }



  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Inpatient Management</h1>
              <p className="text-muted-foreground">Monitor and manage all admitted patients</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => router.push("/ipd")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inpatients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : admissions.length}</div>
                <p className="text-xs text-muted-foreground">Active admissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {loading ? "..." : admissions.filter(a => a.status.toLowerCase() === "critical").length}
                </div>
                <p className="text-xs text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : dashboardStats?.occupancyRate ? `${dashboardStats.occupancyRate}%` : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : `${admissions.length} patients admitted`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Stay</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-muted-foreground">Days per patient</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Name, Admission ID, UHID..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="observation">Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor</label>
                  <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All doctors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ward</label>
                  <Select value={wardFilter} onValueChange={setWardFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All wards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wards</SelectItem>
                      {wards.map(ward => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admitted Patients ({filteredAdmissions.length})
              </CardTitle>
              <CardDescription>Manage current inpatients and their care</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Patient Info</TableHead>
                      <TableHead>Ward/Bed</TableHead>
                      <TableHead>Consulting Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days Admitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmissions.map(admission => (
                      <TableRow key={admission.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{admission.patient.firstName} {admission.patient.lastName}</div>
                            <div className="text-sm text-muted-foreground">
                              {admission.admissionId} • {admission.patient.phone}
                            </div>
                            <div className="text-xs text-muted-foreground">{admission.provisionalDiagnosis}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{admission.bed.ward.name}</div>
                            <Badge variant="outline" className="text-xs">
                              Bed {admission.bed.bedNumber}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">Dr. {admission.doctor.firstName} {admission.doctor.lastName}</div>
                            <div className="text-sm text-muted-foreground">{admission.doctor.primaryDepartment?.name || 'No Department'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={getStatusBadgeColor(admission.status)} 
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(admission.status)}
                              {admission.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getDaysAdmitted(admission.admissionDate)} days</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(admission)
                                setShowPatientModal(true)
                              }}
                            >
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(admission)
                                setShowStatusModal(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Status
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-600"
                              onClick={() => {
                                setSelectedPatient(admission)
                                setShowDischargeModal(true)
                              }}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Discharge
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAdmissions.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-sm font-semibold">No patients found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== "all" || doctorFilter !== "all" || wardFilter !== "all"
                      ? "Try adjusting your search criteria."
                      : "No patients are currently admitted."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Details Modal */}
          <PatientDetailsModal
            patient={selectedPatient}
            isOpen={showPatientModal}
            onClose={() => {
              setShowPatientModal(false)
              setSelectedPatient(null)
            }}
          />

          {/* Status Update Modal */}
          <StatusUpdateModal
            patient={selectedPatient}
            isOpen={showStatusModal}
            onClose={() => {
              setShowStatusModal(false)
              setSelectedPatient(null)
            }}
            onStatusUpdate={fetchAllData}
          />

          {/* Discharge Modal */}
          <DischargeModal
            patient={selectedPatient}
            isOpen={showDischargeModal}
            onClose={() => {
              setShowDischargeModal(false)
              setSelectedPatient(null)
            }}
            onDischarge={fetchAllData}
          />
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
