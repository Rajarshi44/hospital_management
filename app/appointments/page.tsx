"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar, Clock, User, Search, Filter, Plus, Edit, XCircle, CheckCircle,
  Video, MapPin, AlertCircle, MoreVertical, RefreshCw, Eye
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { BookAppointmentDialog } from "@/components/appointments/book-appointment-dialog"

import { Appointment, AppointmentStatus } from "@/lib/appointments-types"
import { useAppointments } from "@/hooks/useAppointments"

// Hook to fetch doctors and departments
const useDoctorsAndDepartments = () => {
  const [doctors, setDoctors] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [doctorsRes, departmentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/doctors?limit=100`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/departments?limit=100`, { headers: getAuthHeaders() }),
      ])

      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json()
        setDoctors(doctorsData)
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json()
        setDepartments(departmentsData)
      }
    } catch (error) {
      console.error('Error fetching doctors/departments:', error)
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    console.log('🏥 Fetching doctors and departments...')
    fetchData()
  }, [fetchData])

  return { doctors, departments, loading }
}

// Transform backend appointment to frontend format
const transformAppointment = (backendAppointment: any): Appointment => {
  return {
    id: backendAppointment.id,
    appointmentId: backendAppointment.appointmentId || `APT${backendAppointment.id}`,
    patientId: backendAppointment.patientId,
    patientName: backendAppointment.patientName || 
      `${backendAppointment.patient?.firstName || ''} ${backendAppointment.patient?.lastName || ''}`.trim(),
    patientUHID: backendAppointment.patient?.patientId || 'N/A',
    patientPhone: backendAppointment.patient?.phone || '',
    doctorId: backendAppointment.doctorId,
    doctorName: backendAppointment.doctorName || 
      `Dr. ${backendAppointment.doctor?.firstName || ''} ${backendAppointment.doctor?.lastName || ''}`.trim(),
    departmentId: backendAppointment.departmentId || '',
    department: backendAppointment.department?.name || 'Unknown',
    date: backendAppointment.date,
    timeSlot: `${backendAppointment.startTime} - ${backendAppointment.endTime}`,
    slot: `${new Date(backendAppointment.date).toLocaleDateString()} ${backendAppointment.startTime} - ${backendAppointment.endTime}`,
    mode: "Offline" as const, // Default mode, could be enhanced based on backend data
    status: mapBackendStatus(backendAppointment.status),
    visitType: "First Visit" as const, // Default, could be enhanced
    priority: backendAppointment.priority === 'URGENT' || backendAppointment.priority === 'EMERGENCY',
    notes: backendAppointment.notes,
    consultationFee: backendAppointment.consultationFee || backendAppointment.doctor?.consultationFee || 0,
    paymentMode: "Cash" as const,
    paymentStatus: "Pending" as const,
    createdAt: backendAppointment.createdAt,
    updatedAt: backendAppointment.updatedAt,
  }
}

const mapBackendStatus = (backendStatus: string): AppointmentStatus => {
  const statusMap: Record<string, AppointmentStatus> = {
    'SCHEDULED': 'Scheduled',
    'CONFIRMED': 'Scheduled',
    'CHECKED_IN': 'Checked-in',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
  }
  return statusMap[backendStatus] || 'Scheduled'
}

const getAppointmentStats = (appointments: Appointment[]) => {
  const today = new Date().toDateString()
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === today
  )
  
  return {
    todayAppointments: todayAppointments.length,
    pending: appointments.filter(apt => 
      apt.status === 'Scheduled' || apt.status === 'Checked-in'
    ).length,
    completed: appointments.filter(apt => apt.status === 'Completed').length,
    cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
  }
}

const filterAppointments = (appointments: Appointment[], filters: any) => {
  return appointments.filter(apt => {
    // Patient search
    if (filters.patientSearch) {
      const search = filters.patientSearch.toLowerCase()
      const matchesName = apt.patientName.toLowerCase().includes(search)
      const matchesUHID = apt.patientUHID.toLowerCase().includes(search)
      const matchesPhone = apt.patientPhone.includes(search)
      if (!matchesName && !matchesUHID && !matchesPhone) return false
    }
    
    // Doctor filter
    if (filters.doctorId && filters.doctorId !== 'all' && apt.doctorId !== filters.doctorId) return false
    
    // Department filter
    if (filters.departmentId && filters.departmentId !== 'all' && apt.departmentId !== filters.departmentId) return false
    
    // Status filter
    if (filters.status && filters.status !== 'all' && apt.status !== filters.status) return false
    
    // Mode filter
    if (filters.mode && filters.mode !== 'all' && apt.mode !== filters.mode) return false
    
    // Date filters
    if (filters.dateFrom) {
      const aptDate = new Date(apt.date)
      const fromDate = new Date(filters.dateFrom)
      if (aptDate < fromDate) return false
    }
    
    if (filters.dateTo) {
      const aptDate = new Date(apt.date)
      const toDate = new Date(filters.dateTo)
      if (aptDate > toDate) return false
    }
    
    return true
  })
}

export default function AppointmentsPage() {
  const { toast } = useToast()
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  
  // Filters
  const [patientSearch, setPatientSearch] = useState("")
  const [doctorFilter, setDoctorFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [modeFilter, setModeFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Use appointments hook
  const { 
    appointments: backendAppointments, 
    isLoading, 
    error,
    getAppointments 
  } = useAppointments({
    onError: (error) => {
      toast({
        title: "Error Loading Appointments",
        description: error,
        variant: "destructive",
      })
    }
  })

  // Use doctors and departments hook
  const { doctors, departments } = useDoctorsAndDepartments()

  // Transform backend appointments to frontend format
  const appointments = useMemo(() => {
    return (backendAppointments || []).map(transformAppointment)
  }, [backendAppointments])
  
  // Stats
  const stats = useMemo(() => {
    return getAppointmentStats(appointments)
  }, [appointments])

  // Create stable function reference
  const loadAppointments = useCallback(() => {
    getAppointments({ limit: 100, includeOPD: true })
  }, [getAppointments])

  // Load appointments on component mount
  useEffect(() => {
    console.log('🔄 Loading appointments including OPD visits...')
    loadAppointments()
  }, [loadAppointments])

  // Apply filters
  useEffect(() => {
    const filtered = filterAppointments(appointments, {
      patientSearch,
      doctorId: doctorFilter === "all" ? "" : doctorFilter,
      departmentId: departmentFilter === "all" ? "" : departmentFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      mode: modeFilter === "all" ? "" : modeFilter,
      dateFrom,
      dateTo,
    })
    setFilteredAppointments(filtered)
  }, [appointments, patientSearch, doctorFilter, departmentFilter, statusFilter, modeFilter, dateFrom, dateTo])

  const handleBookSuccess = useCallback((data: any) => {
    // Refresh appointments after booking
    loadAppointments()
    
    toast({
      title: "Appointment Booked",
      description: "Appointment has been scheduled successfully",
    })
  }, [loadAppointments, toast])

  const handleStatusChange = useCallback(async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      // Here you would call an update API endpoint
      // For now, we'll just refresh the data
      loadAppointments()
      
      const statusMessages: Record<AppointmentStatus, string> = {
        "Scheduled": "Appointment scheduled",
        "Checked-in": "Patient checked in",
        "In Progress": "Consultation in progress", 
        "Completed": "Appointment completed",
        "Cancelled": "Appointment cancelled",
      }
      
      toast({
        title: "Status Updated",
        description: statusMessages[newStatus],
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }, [loadAppointments, toast])

  const clearFilters = () => {
    setPatientSearch("")
    setDoctorFilter("")
    setDepartmentFilter("")
    setStatusFilter("")
    setModeFilter("")
    setDateFrom("")
    setDateTo("")
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    const variants: Record<AppointmentStatus, { variant: any; icon: any }> = {
      "Scheduled": { variant: "secondary", icon: Clock },
      "Checked-in": { variant: "default", icon: User },
      "In Progress": { variant: "default", icon: AlertCircle },
      "Completed": { variant: "default", icon: CheckCircle },
      "Cancelled": { variant: "destructive", icon: XCircle },
    }
    
    const { variant, icon: Icon } = variants[status]
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getModeBadge = (mode: "Offline" | "Tele/Video") => {
    return mode === "Offline" ? (
      <Badge variant="outline" className="gap-1">
        <MapPin className="h-3 w-3" />
        In-Person
      </Badge>
    ) : (
      <Badge variant="outline" className="gap-1">
        <Video className="h-3 w-3" />
        Tele/Video
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
              <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
              <p className="text-muted-foreground">Manage patient appointments and schedules</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                <p className="text-xs text-muted-foreground">Total scheduled for today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending / Waiting</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting consultation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">Completed today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <p className="text-xs text-muted-foreground">Cancelled today</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filters
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patient (Name, UHID, Phone)"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={doctorFilter || undefined} onValueChange={(value) => setDoctorFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={departmentFilter || undefined} onValueChange={(value) => setDepartmentFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter || undefined} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Checked-in">Checked-in</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={modeFilter || undefined} onValueChange={(value) => setModeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="Offline">In-Person</SelectItem>
                    <SelectItem value="Tele/Video">Tele/Video</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />

                <Input
                  type="date"
                  placeholder="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointments List</CardTitle>
                <Badge variant="secondary">
                  {isLoading ? 'Loading...' : `${filteredAppointments.length} appointments`}
                </Badge>
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Error: {error}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appt. ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading appointments...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          {error ? 'Failed to load appointments' : 'No appointments found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">{appointment.appointmentId}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{appointment.patientName}</p>
                              <p className="text-xs text-muted-foreground">{appointment.patientUHID}</p>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.doctorName}</TableCell>
                          <TableCell>{appointment.department}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{appointment.slot.split(' ')[0]}</span>
                              <span className="text-xs text-muted-foreground">{appointment.timeSlot}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getModeBadge(appointment.mode)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(appointment.status)}
                              {appointment.priority && (
                                <Badge variant="destructive" className="text-xs">
                                  Priority
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
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
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {appointment.status === "Scheduled" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "Checked-in")}>
                                    <User className="h-4 w-4 mr-2" />
                                    Check-In
                                  </DropdownMenuItem>
                                )}
                                {appointment.status === "Checked-in" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "In Progress")}>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Start Consultation
                                  </DropdownMenuItem>
                                )}
                                {appointment.status === "In Progress" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "Completed")}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "Cancelled")}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <BookAppointmentDialog
          open={showBookDialog}
          onOpenChange={setShowBookDialog}
          onSuccess={handleBookSuccess}
        />
      </AppLayout>
    </AuthProvider>
  )
}
