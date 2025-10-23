"use client"

import { useState } from "react"
import { Users, Bed, Filter, Search, Plus, Activity, FileText, ArrowUpDown, AlertTriangle, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { mockAdmissions, getDaysAdmitted } from "@/lib/ipd-mock-data"
import { mockDoctors, mockDepartments } from "@/lib/schedule-mock-data"
import { VitalsForm, TreatmentForm, BedTransferForm } from "@/components/ipd"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"

export default function InpatientListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [wardFilter, setWardFilter] = useState("all")
  const [selectedAdmission, setSelectedAdmission] = useState<string | null>(null)

  const filteredAdmissions = mockAdmissions.filter(admission => {
    const matchesSearch = !searchQuery || 
      admission.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.admissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.uhid.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || admission.status === statusFilter
    const matchesDoctor = doctorFilter === "all" || admission.consultingDoctorId === doctorFilter
    const matchesWard = wardFilter === "all" || admission.wardId === wardFilter
    
    return matchesSearch && matchesStatus && matchesDoctor && matchesWard
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive'
      case 'stable': return 'default'
      case 'observation': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />
      case 'stable': return <Check className="h-3 w-3" />
      case 'observation': return <Activity className="h-3 w-3" />
      default: return null
    }
  }

  const wardOptions = [
    { id: "1", name: "General Ward A" },
    { id: "3", name: "Private Ward" },
    { id: "5", name: "ICU Ward" }
  ]

  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inpatient Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all admitted patients
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Admission
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
            <div className="text-2xl font-bold">{mockAdmissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Active admissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockAdmissions.filter(a => a.status === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              52 of 67 beds occupied
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
            <p className="text-xs text-muted-foreground">
              Days per patient
            </p>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  {mockDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
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
                  {wardOptions.map((ward) => (
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
          <CardDescription>
            Manage current inpatients and their care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Patient Info</TableHead>
                  <TableHead>Ward/Bed</TableHead>
                  <TableHead>Consulting Doctor</TableHead>
                  <TableHead>Days Admitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.map((admission) => (
                  <TableRow key={admission.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{admission.patientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {admission.admissionId} • {admission.uhid}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {admission.tentativeDiagnosis}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{admission.wardName}</div>
                        <Badge variant="outline" className="text-xs">
                          Bed {admission.bedNumber}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{admission.consultingDoctorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {admission.departmentName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getDaysAdmitted(admission.admissionDate)} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeColor(admission.status)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(admission.status)}
                        {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Transfer
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Transfer Patient</DialogTitle>
                              <DialogDescription>
                                Transfer {admission.patientName} to a different ward/bed
                              </DialogDescription>
                            </DialogHeader>
                            <BedTransferForm admission={admission} />
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Vitals
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Record Vitals</DialogTitle>
                              <DialogDescription>
                                Record vital signs for {admission.patientName}
                              </DialogDescription>
                            </DialogHeader>
                            <VitalsForm admissionId={admission.admissionId} />
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Treatment
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Add Treatment</DialogTitle>
                              <DialogDescription>
                                Add medication, procedure, or lab order for {admission.patientName}
                              </DialogDescription>
                            </DialogHeader>
                            <TreatmentForm admissionId={admission.admissionId} />
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm">
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
        </div>
      </AppLayout>
    </AuthProvider>
  )
}