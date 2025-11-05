"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, TestTube } from "lucide-react"

const LAB_DEPARTMENTS = [
  "Hematology",
  "Endocrinology",
  "Biochemistry",
  "Serology",
  "Cytology",
  "Microbiology",
  "Histopathology",
  "Clinical Pathology",
] as const

type LabTest = {
  id: string
  name: string
  department: string
  description: string
  createdAt: Date
}

export function LabTestMaster() {
  const [tests, setTests] = useState<LabTest[]>([
    {
      id: "1",
      name: "Complete Blood Count (CBC)",
      department: "Hematology",
      description: "Comprehensive blood cell analysis",
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Thyroid Function Test",
      department: "Endocrinology",
      description: "TSH, T3, T4 levels",
      createdAt: new Date(),
    },
    {
      id: "3",
      name: "Liver Function Test",
      department: "Biochemistry",
      description: "ALT, AST, Bilirubin levels",
      createdAt: new Date(),
    },
  ])

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    description: "",
  })

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.department) {
      alert("Please fill in test name and department")
      return
    }

    const newTest: LabTest = {
      id: Date.now().toString(),
      name: formData.name,
      department: formData.department,
      description: formData.description,
      createdAt: new Date(),
    }

    setTests([...tests, newTest])
    setFormData({ name: "", department: "", description: "" })
  }

  const handleDeleteTest = (id: string) => {
    setTests(tests.filter((test) => test.id !== id))
  }

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      Hematology: "bg-red-100 text-red-800",
      Endocrinology: "bg-purple-100 text-purple-800",
      Biochemistry: "bg-blue-100 text-blue-800",
      Serology: "bg-green-100 text-green-800",
      Cytology: "bg-yellow-100 text-yellow-800",
      Microbiology: "bg-orange-100 text-orange-800",
      Histopathology: "bg-pink-100 text-pink-800",
      "Clinical Pathology": "bg-indigo-100 text-indigo-800",
    }
    return colors[department] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Test Form */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Add New Test
          </CardTitle>
          <CardDescription>Define a new laboratory test</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testName">Test Name *</Label>
              <Input
                id="testName"
                placeholder="e.g., Complete Blood Count"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {LAB_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Test List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Lab Test Master</CardTitle>
          <CardDescription>
            Manage available laboratory tests ({tests.length} tests configured)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No tests configured. Add your first test using the form.
                  </TableCell>
                </TableRow>
              ) : (
                tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>
                      <Badge className={getDepartmentColor(test.department)} variant="secondary">
                        {test.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {test.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTest(test.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
