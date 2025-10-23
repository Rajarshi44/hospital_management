"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getDoctors, deleteDoctor, getDepartments, getSpecializations, getDoctorStats } from "@/lib/doctor-service"
import type { Doctor } from "@/lib/types"
import { AppLayout } from "@/components/app-shell/app-layout"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [departments, setDepartments] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, byDepartment: {} })
  const { toast } = useToast()

  useEffect(() => {
    loadDoctors()
    setDepartments(getDepartments())
    setSpecializations(getSpecializations())
    setStats(getDoctorStats())
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, selectedDepartment, selectedSpecialization, statusFilter])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const data = await getDoctors()
      setDoctors(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doctor =>
        doctor.firstName.toLowerCase().includes(query) ||
        doctor.lastName.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.department.toLowerCase().includes(query) ||
        doctor.employeeId.toLowerCase().includes(query)
      )
    }

    if (selectedDepartment && selectedDepartment !== "all") {
      filtered = filtered.filter(doctor => doctor.department === selectedDepartment)
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
      await deleteDoctor(doctorId)
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      })
      loadDoctors()
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
            <p className="text-muted-foreground">
              Manage and oversee all registered doctors in the hospital
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.location.href = "/doctors/register"}
              className="gap-2"
            >
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
            <p className="text-xs text-muted-foreground">
              Registered doctors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Doctors</CardTitle>
            <UserCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Not currently working
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter doctors by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedDepartment || undefined} onValueChange={(value) => setSelectedDepartment(value || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSpecialization || undefined} onValueChange={(value) => setSelectedSpecialization(value || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter || undefined} onValueChange={(value) => setStatusFilter(value || "")}>
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
              <CardDescription>
                Complete list of registered doctors
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={doctor.profileImage} alt={`${doctor.firstName} ${doctor.lastName}`} />
                    <AvatarFallback>
                      {doctor.firstName[0]}{doctor.lastName[0]}
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
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{doctor.employeeId}</span>
                      <span>{doctor.specialization}</span>
                      <span>{doctor.department}</span>
                      <span>{doctor.experience} years exp.</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {doctor.phone} • {doctor.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "View Details",
                        description: `Viewing details for Dr. ${doctor.firstName} ${doctor.lastName}`,
                      })
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
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
              <div className="text-center py-8 text-muted-foreground">
                No doctors found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  )
}