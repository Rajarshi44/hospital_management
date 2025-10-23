"use client"

import { useState } from "react"
import { Plus, Search, Users, Building2, MapPin, Clock } from "lucide-react"
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

interface Department {
  id: string
  name: string
  description: string
  head: string
  doctorCount: number
  location: string
  established: string
  status: "active" | "inactive"
  subDepartments: string[]
}

const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Cardiology",
    description: "Specialized care for heart and cardiovascular conditions",
    head: "Dr. Sarah Johnson",
    doctorCount: 12,
    location: "Building A, Floor 3",
    established: "2015",
    status: "active",
    subDepartments: ["Interventional Cardiology", "Pediatric Cardiology", "Cardiac Surgery"],
  },
  {
    id: "2",
    name: "Neurology",
    description: "Treatment of nervous system disorders",
    head: "Dr. Michael Chen",
    doctorCount: 8,
    location: "Building B, Floor 2",
    established: "2018",
    status: "active",
    subDepartments: ["Neurosurgery", "Pediatric Neurology"],
  },
  {
    id: "3",
    name: "Orthopedics",
    description: "Bone, joint, and musculoskeletal care",
    head: "Dr. Robert Smith",
    doctorCount: 15,
    location: "Building C, Floor 1",
    established: "2012",
    status: "active",
    subDepartments: ["Sports Medicine", "Spine Surgery", "Joint Replacement"],
  },
  {
    id: "4",
    name: "Pediatrics",
    description: "Medical care for infants, children, and adolescents",
    head: "Dr. Emily Davis",
    doctorCount: 10,
    location: "Building A, Floor 2",
    established: "2010",
    status: "active",
    subDepartments: ["Neonatology", "Pediatric Emergency"],
  },
  {
    id: "5",
    name: "Emergency Medicine",
    description: "24/7 emergency and trauma care",
    head: "Dr. James Wilson",
    doctorCount: 20,
    location: "Ground Floor, Wing A",
    established: "2008",
    status: "active",
    subDepartments: ["Trauma Center", "Critical Care"],
  },
]

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredDepartments = departments.filter(
    dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalDoctors = departments.reduce((sum, dept) => sum + dept.doctorCount, 0)
  const activeDepartments = departments.filter(dept => dept.status === "active").length

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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>Create a new department in the hospital system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Department Name</Label>
                <Input id="name" placeholder="e.g., Cardiology" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief description of the department" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="head">Department Head</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-johnson">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="dr-smith">Dr. Robert Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g., Building A, Floor 3" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Create Department</Button>
            </div>
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
            <div className="text-2xl font-bold">{Math.max(...departments.map(d => d.doctorCount))}</div>
            <p className="text-xs text-muted-foreground">
              {departments.find(d => d.doctorCount === Math.max(...departments.map(d => d.doctorCount)))?.name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Established Since</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.min(...departments.map(d => parseInt(d.established)))}</div>
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
                      <CardDescription className="mt-1">{department.description}</CardDescription>
                    </div>
                    <Badge variant={department.status === "active" ? "default" : "secondary"}>
                      {department.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Department Head:</span>
                      <span className="font-medium">{department.head}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Doctors:</span>
                      <span className="font-medium">{department.doctorCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{department.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Established:</span>
                      <span className="font-medium">{department.established}</span>
                    </div>
                  </div>

                  {department.subDepartments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Sub-departments:</p>
                      <div className="flex flex-wrap gap-1">
                        {department.subDepartments.map((sub, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Manage Staff
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
              <CardDescription>Organizational structure and reporting relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map(dept => (
                  <div key={dept.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{dept.name}</h3>
                      <Badge>{dept.doctorCount} doctors</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Head: {dept.head}</p>
                    {dept.subDepartments.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {dept.subDepartments.map((sub, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            ├── {sub}
                          </div>
                        ))}
                      </div>
                    )}
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
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Key metrics and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">{dept.doctorCount} doctors</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">95% satisfaction</p>
                        <p className="text-xs text-muted-foreground">Patient rating</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Department resource allocation and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map(dept => (
                    <div key={dept.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{dept.name}</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
