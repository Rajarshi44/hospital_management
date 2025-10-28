"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, UserCheck, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useDoctor, type Doctor } from "@/hooks/use-doctor"
import { useDepartments } from "@/hooks/use-departments"
import { AppLayout } from "@/components/app-shell/app-layout"
import { DoctorDetailsModal } from "@/components/doctors/doctor-details-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function DoctorsPage() {
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showHODDialog, setShowHODDialog] = useState(false)
  const [selectedDoctorForHOD, setSelectedDoctorForHOD] = useState<Doctor | null>(null)
  
  const { doctors, loading, fetchDoctors, deleteDoctor: deleteDoctorFromAPI, updateDoctor } = useDoctor()
  const { departments: departmentsList, assignHeadDoctor, removeHeadDoctor } = useDepartments()
  const { toast } = useToast()

  // Extract unique departments and specializations from doctors data
  const departments = Array.from(new Set(doctors.map(d => d.primaryDepartment?.name || d.department).filter(Boolean))) as string[]
  const specializations = Array.from(new Set(doctors.map(d => d.specialization)))
  
  // Calculate stats
  const stats = {
    total: doctors.length,
    active: doctors.filter(d => d.isActive).length,
    inactive: doctors.filter(d => !d.isActive).length,
  }

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, selectedDepartment, selectedSpecialization, statusFilter])

  const filterDoctors = () => {
    let filtered = doctors

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        doctor =>
          doctor.firstName.toLowerCase().includes(query) ||
          doctor.lastName.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query) ||
          ((doctor.primaryDepartment?.name || doctor.department) && (doctor.primaryDepartment?.name || doctor.department)!.toLowerCase().includes(query))
      )
    }

    if (selectedDepartment && selectedDepartment !== "all") {
      filtered = filtered.filter(doctor => (doctor.primaryDepartment?.name || doctor.department) === selectedDepartment)
    }

    if (selectedSpecialization && selectedSpecialization !== "all") {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization)
    }

    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(doctor => doctor.isActive)
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(doctor => !doctor.isActive)
      }
    }

    setFilteredDoctors(filtered)
  }

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      await deleteDoctorFromAPI(doctorId)
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      })
      fetchDoctors()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedDepartment("")
    setSelectedSpecialization("")
    setStatusFilter("")
  }

  const handleAssignHOD = (doctor: Doctor) => {
    setSelectedDoctorForHOD(doctor)
    setShowHODDialog(true)
  }

  const confirmAssignHOD = async (departmentId: string) => {
    if (!selectedDoctorForHOD) return
    
    try {
      // Find the department to get its name
      const department = departmentsList.find(dept => dept.id === departmentId)
      if (!department) {
        toast({
          title: "Error",
          description: "Department not found",
          variant: "destructive",
        })
        return
      }

      // First, update the doctor's department if it's different
      const currentDepartmentName = selectedDoctorForHOD.primaryDepartment?.name || selectedDoctorForHOD.department;
      if (currentDepartmentName !== department.name) {
        await updateDoctor(selectedDoctorForHOD.id, { department: department.name })
      }

      // Then assign as HOD
      await assignHeadDoctor(departmentId, selectedDoctorForHOD.id)
      
      toast({
        title: "Success",
        description: `Dr. ${selectedDoctorForHOD.firstName} ${selectedDoctorForHOD.lastName} has been assigned as Head of ${department.name} Department`,
      })
      
      // Refresh doctors list to reflect the department change
      fetchDoctors()
      
      setShowHODDialog(false)
      setSelectedDoctorForHOD(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign Head of Department",
        variant: "destructive",
      })
    }
  }

  const handleRemoveHOD = async (doctor: Doctor, departmentId: string) => {
    if (confirm(`Remove Dr. ${doctor.firstName} ${doctor.lastName} as Head of Department?`)) {
      try {
        await removeHeadDoctor(departmentId)
        toast({
          title: "Success",
          description: "Head of Department removed successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove Head of Department",
          variant: "destructive",
        })
      }
    }
  }

  // Check if doctor is HOD of any department
  const isHOD = (doctorId: string) => {
    return departmentsList.some(dept => dept.headDoctorId === doctorId)
  }

  // Get department where doctor is HOD
  const getHODDepartment = (doctorId: string) => {
    return departmentsList.find(dept => dept.headDoctorId === doctorId)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doctor Management</h1>
            <p className="text-muted-foreground">Manage and oversee all registered doctors in the hospital</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => (window.location.href = "/doctors/register")} className="gap-2">
              <Plus className="h-4 w-4" />
              Register New Doctor
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Registered doctors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">Not currently working</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter doctors by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={selectedDepartment || undefined}
                onValueChange={value => setSelectedDepartment(value || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedSpecialization || undefined}
                onValueChange={value => setSelectedSpecialization(value || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter || undefined} onValueChange={value => setStatusFilter(value || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Doctors ({filteredDoctors.length})</CardTitle>
                <CardDescription>Complete list of registered doctors</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {doctor.firstName[0]}
                        {doctor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <Badge variant={doctor.isActive ? "default" : "secondary"}>
                          {doctor.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {isHOD(doctor.id) && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Crown className="w-3 h-3 mr-1" />
                            HOD
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>ID: {doctor.id}</span>
                        <span>{doctor.specialization}</span>
                        <span>{doctor.primaryDepartment?.name || doctor.department || "No Department"}</span>
                        <span>{doctor.experience} years exp.</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {doctor.phone} • {doctor.email}
                        {isHOD(doctor.id) && (
                          <span className="ml-2 text-yellow-600">
                            • Head of {getHODDepartment(doctor.id)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDoctor(doctor)
                        setShowDetailsModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isHOD(doctor.id) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const dept = getHODDepartment(doctor.id)
                          if (dept) handleRemoveHOD(doctor, dept.id)
                        }}
                        className="text-yellow-600"
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignHOD(doctor)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}?`)) {
                          handleDeleteDoctor(doctor.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No doctors found matching your criteria.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          open={showDetailsModal}
          onOpenChange={(open) => {
            setShowDetailsModal(open)
            if (!open) setSelectedDoctor(null)
          }}
        />
      )}

      {/* HOD Assignment Dialog */}
      <Dialog open={showHODDialog} onOpenChange={setShowHODDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Head of Department</DialogTitle>
            <DialogDescription>
              Assign Dr. {selectedDoctorForHOD?.firstName} {selectedDoctorForHOD?.lastName} as Head of Department.
              {selectedDoctorForHOD?.department && (
                <span className="block mt-1 text-sm">
                  Current department: {selectedDoctorForHOD.department}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="department">Select Department</Label>
              <Select onValueChange={confirmAssignHOD}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} 
                      {dept.headDoctorId && " (Currently has HOD)"}
                      {(selectedDoctorForHOD?.department !== dept.name && selectedDoctorForHOD?.primaryDepartment?.name !== dept.name) && " (Will transfer doctor)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedDoctorForHOD?.department && (
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <strong>Note:</strong> If you select a different department, the doctor will be transferred to that department and then assigned as HOD.
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowHODDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
