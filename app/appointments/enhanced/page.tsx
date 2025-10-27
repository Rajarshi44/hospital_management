"use client"

import { useState, useEffect } from "react"
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
import { mockAppointments, getAppointmentStats, filterAppointments } from "@/lib/appointments-mock-data"
import { mockDoctors, mockDepartments } from "@/lib/schedule-mock-data"
import { Appointment, AppointmentStatus } from "@/lib/appointments-types"

export default function EnhancedAppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(mockAppointments)
  const [showBookDialog, setShowBookDialog] = useState(false)
  
  // Filters
  const [patientSearch, setPatientSearch] = useState("")
  const [doctorFilter, setDoctorFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [modeFilter, setModeFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Stats
  const stats = getAppointmentStats(appointments)

  // Apply filters
  useEffect(() => {
    const filtered = filterAppointments(appointments, {
      patientSearch,
      doctorId: doctorFilter,
      departmentId: departmentFilter,
      status: statusFilter,
      mode: modeFilter,
      dateFrom,
      dateTo,
    })
    setFilteredAppointments(filtered)
  }, [appointments, patientSearch, doctorFilter, departmentFilter, statusFilter, modeFilter, dateFrom, dateTo])

  const handleBookSuccess = (data: any) => {
    const newAppointment: Appointment = {
      id: String(appointments.length + 1),
      appointmentId: `APT${String(appointments.length + 1).padStart(3, '0')}`,
      ...data,
      slot: `${new Date(data.appointmentDate).toLocaleDateString()} ${data.timeSlot}`,
      status: "Scheduled" as AppointmentStatus,
      paymentStatus: "Pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setAppointments([newAppointment, ...appointments])
  }

  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() }
          : apt
      )
    )
    
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
  }

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
            <Button onClick={() => setShowBookDialog(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Book Appointment
            </Button>
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

                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Doctors</SelectItem>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Checked-in">Checked-in</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Modes</SelectItem>
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
                <Badge variant="secondary">{filteredAppointments.length} appointments</Badge>
              </div>
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
                    {filteredAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No appointments found
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
