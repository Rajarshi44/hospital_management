"use client"

import { useState } from "react"
import { Plus, Search, Users, Building2, MapPin, Clock, Crown, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDepartments , Department } from "@/hooks/doctor/use-departments"
import { useDoctor } from "@/hooks/doctor/use-doctor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const departmentFormSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  established: z.string().optional(),
  headDoctorId: z.string().optional(),
})

export function DepartmentManagement() {
  const { 
    departments, 
    loading: departmentsLoading, 
    error: departmentsError,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignHeadDoctor,
    removeHeadDoctor
  } = useDepartments()
  
  const { doctors, loading: doctorsLoading, getDoctorsByDepartment } = useDoctor()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [viewDoctorsDialogOpen, setViewDoctorsDialogOpen] = useState(false)
  const [selectedDepartmentForView, setSelectedDepartmentForView] = useState<Department | null>(null)
  const [departmentDoctors, setDepartmentDoctors] = useState<any[]>([])
  const [loadingDepartmentDoctors, setLoadingDepartmentDoctors] = useState(false)

  const form = useForm<z.infer<typeof departmentFormSchema>>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      established: "",
      headDoctorId: "",
    },
  })

  const filteredDepartments = departments.filter(
    dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.headDoctor && 
        `${dept.headDoctor.firstName} ${dept.headDoctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalDoctors = departments.reduce((sum, dept) => sum + (dept.doctorCount || 0), 0)
  const activeDepartments = departments.length // All departments are active in our new system

  const onSubmit = async (values: z.infer<typeof departmentFormSchema>) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, values)
      } else {
        await createDepartment(values)
      }
      setIsAddDialogOpen(false)
      setEditingDepartment(null)
      form.reset()
    } catch (error) {
      console.error('Error saving department:', error)
    }
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    form.reset({
      name: department.name,
      description: department.description || "",
      location: department.location || "",
      established: department.established || "",
      headDoctorId: department.headDoctorId || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (departmentId: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      await deleteDepartment(departmentId)
    }
  }

  const handleAssignHOD = async (departmentId: string, doctorId: string) => {
    await assignHeadDoctor(departmentId, doctorId)
  }

  const handleRemoveHOD = async (departmentId: string) => {
    if (confirm("Are you sure you want to remove the head of department?")) {
      await removeHeadDoctor(departmentId)
    }
  }

  const handleViewDoctors = async (department: Department) => {
    setSelectedDepartmentForView(department)
    setLoadingDepartmentDoctors(true)
    setViewDoctorsDialogOpen(true)
    
    try {
      const doctors = await getDoctorsByDepartment(department.id)
      setDepartmentDoctors(doctors)
    } catch (error) {
      console.error('Error fetching department doctors:', error)
      setDepartmentDoctors([])
    } finally {
      setLoadingDepartmentDoctors(false)
    }
  }

  if (departmentsLoading) {
    return <div className="flex justify-center items-center h-48">Loading departments...</div>
  }

  if (departmentsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{departmentsError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Management</h1>
          <p className="text-muted-foreground">
            Manage hospital departments, their staff, and organizational structure
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) {
            setEditingDepartment(null)
            form.reset()
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
              <DialogDescription>
                {editingDepartment ? "Update department information." : "Create a new department in the hospital system."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Cardiology" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Brief description of the department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headDoctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Head</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department head" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No head assigned</SelectItem>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Building A, Floor 3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="established"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Established</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2015" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDepartment ? "Update Department" : "Create Department"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">{activeDepartments} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDoctors}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Department</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.length > 0 ? Math.max(...departments.map(d => d.doctorCount || 0)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {departments.find(d => d.doctorCount === Math.max(...departments.map(d => d.doctorCount || 0)))?.name || "None"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Established Since</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.filter(d => d.established).length > 0 
                ? Math.min(...departments.filter(d => d.established).map(d => parseInt(d.established!))) 
                : new Date().getFullYear()}
            </div>
            <p className="text-xs text-muted-foreground">Oldest department</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDepartments.map(department => (
              <Card key={department.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      <CardDescription className="mt-1">{department.description || "No description available"}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {department.headDoctor && (
                        <Badge variant="secondary">
                          <Crown className="w-3 h-3 mr-1" />
                          HOD
                        </Badge>
                      )}
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Department Head:</span>
                      <span className="font-medium">
                        {department.headDoctor 
                          ? `Dr. ${department.headDoctor.firstName} ${department.headDoctor.lastName}`
                          : "Not assigned"
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Doctors:</span>
                      <span className="font-medium">{department.doctorCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{department.location || "Not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Established:</span>
                      <span className="font-medium">{department.established || "Not specified"}</span>
                    </div>
                  </div>

                  {department.headDoctor && (
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Head of Department</p>
                      <p className="text-sm text-muted-foreground">
                        {department.headDoctor.specialization}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {department.headDoctor.email}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDoctors(department)}>
                      <Eye className="w-3 h-3 mr-1" />
                      View Doctors
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(department)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(department.id)}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Hierarchy</CardTitle>
              <CardDescription>Organizational structure and department heads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map(dept => (
                  <div key={dept.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {dept.name}
                        {dept.headDoctor && <Crown className="w-4 h-4 text-yellow-500" />}
                      </h3>
                      <Badge>{dept.doctorCount || 0} doctors</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Head: {dept.headDoctor 
                          ? `Dr. ${dept.headDoctor.firstName} ${dept.headDoctor.lastName}` 
                          : "Not assigned"
                        }
                      </p>
                      {dept.location && (
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {dept.location}
                        </p>
                      )}
                      {dept.headDoctor && (
                        <div className="ml-4 p-2 bg-secondary/50 rounded">
                          <p className="text-sm font-medium">
                            {dept.headDoctor.specialization}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dept.headDoctor.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Statistics</CardTitle>
                <CardDescription>Department staffing and management status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {dept.name}
                          {dept.headDoctor && <Crown className="w-3 h-3 text-yellow-500" />}
                        </p>
                        <p className="text-sm text-muted-foreground">{dept.doctorCount || 0} doctors</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {dept.headDoctor ? "Complete" : "Needs HOD"}
                        </p>
                        <p className="text-xs text-muted-foreground">Management status</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Coverage</CardTitle>
                <CardDescription>Staff allocation and department leadership</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map(dept => (
                    <div key={dept.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{dept.name}</span>
                        <span>{dept.headDoctor ? "100%" : "80%"}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${dept.headDoctor ? "bg-green-500" : "bg-yellow-500"}`}
                          style={{ width: dept.headDoctor ? "100%" : "80%" }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Doctors Modal */}
      <Dialog open={viewDoctorsDialogOpen} onOpenChange={setViewDoctorsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Doctors in {selectedDepartmentForView?.name}
            </DialogTitle>
            <DialogDescription>
              View all doctors assigned to this department
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingDepartmentDoctors ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-muted-foreground">Loading doctors...</div>
              </div>
            ) : departmentDoctors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No doctors assigned to this department</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departmentDoctors.map((doctor) => (
                  <Card key={doctor.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h4>
                          {selectedDepartmentForView?.headDoctorId === doctor.id && (
                            <Badge variant="secondary">
                              <Crown className="w-3 h-3 mr-1" />
                              HOD
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><strong>Specialization:</strong> {doctor.specialization}</p>
                          <p><strong>Qualification:</strong> {doctor.qualification}</p>
                          <p><strong>Experience:</strong> {doctor.experience} years</p>
                          <p><strong>Email:</strong> {doctor.email}</p>
                          <p><strong>Phone:</strong> {doctor.phone}</p>
                          {doctor.consultationFee && (
                            <p><strong>Consultation Fee:</strong> ₹{doctor.consultationFee}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={doctor.isAvailable ? "default" : "secondary"}>
                          {doctor.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setViewDoctorsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
