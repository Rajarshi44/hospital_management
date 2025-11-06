"use client"

import { useState, useEffect } from "react"
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
import { Plus, Trash2, TestTube, Loader2, Edit } from "lucide-react"
import { useLab } from "@/hooks/useLab"
import { CreateLabTestRequest } from "@/lib/types/lab.types"

export function LabTestMaster() {
  const { 
    tests, 
    departments, 
    loading, 
    createTest, 
    updateTest, 
    deleteTest,
    fetchTests 
  } = useLab()
  
  const [showForm, setShowForm] = useState(false)
  const [editingTest, setEditingTest] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateLabTestRequest>({
    name: "",
    code: "",
    category: "",
    department: "",
    description: "",
    methodology: "",
    sampleType: "",
    price: 0,
    normalRange: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      category: "",
      department: "",
      description: "",
      methodology: "",
      sampleType: "",
      price: 0,
      normalRange: "",
    })
    setEditingTest(null)
    setShowForm(false)
  }

  // Auto-generate test code when name or department changes (only if code is empty)
  useEffect(() => {
    if (formData.name && formData.department && !formData.code && !editingTest) {
      const timer = setTimeout(() => {
        // Auto-generate code logic
        const department = departments.find(d => d.code === formData.department)
        if (!department) return

        const deptCode = department.code.substring(0, 4).toUpperCase()
        const testWords = formData.name.split(' ')
        let testCode = ''
        
        if (testWords.length === 1) {
          testCode = testWords[0].substring(0, 3).toUpperCase()
        } else if (testWords.length <= 3) {
          testCode = testWords.map(word => word.charAt(0)).join('').toUpperCase()
        } else {
          testCode = testWords.slice(0, 3).map(word => word.charAt(0)).join('').toUpperCase()
        }

        const randomNum = Math.floor(Math.random() * 999) + 1
        const paddedNum = randomNum.toString().padStart(3, '0')
        const generatedCode = `${deptCode}-${testCode}${paddedNum}`
        
        setFormData(prev => ({ ...prev, code: generatedCode }))
      }, 800) // Debounce to avoid too frequent updates
      
      return () => clearTimeout(timer)
    }
  }, [formData.name, formData.department, formData.code, editingTest, departments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingTest) {
        await updateTest(editingTest, formData)
      } else {
        await createTest(formData)
      }
      resetForm()
    } catch (error) {
      console.error('Failed to save test:', error)
    }
  }

  const handleEdit = (test: any) => {
    setFormData({
      name: test.name,
      code: test.code,
      category: test.category,
      department: test.department || "",
      description: test.description || "",
      methodology: test.methodology || "",
      sampleType: test.sampleType || "",
      price: test.price,
      normalRange: test.normalRange || "",
    })
    setEditingTest(test.id)
    setShowForm(true)
  }

  const handleDelete = async (testId: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      try {
        await deleteTest(testId)
      } catch (error) {
        console.error('Failed to delete test:', error)
      }
    }
  }

  const generateTestCode = () => {
    if (!formData.name || !formData.department) {
      return
    }

    const department = departments.find(d => d.code === formData.department)
    if (!department) {
      return
    }

    // Generate code based on department code and test name
    const deptCode = department.code.substring(0, 4).toUpperCase() // First 4 chars of dept code
    const testWords = formData.name.split(' ')
    let testCode = ''
    
    // Create abbreviation from test name
    if (testWords.length === 1) {
      testCode = testWords[0].substring(0, 3).toUpperCase()
    } else if (testWords.length <= 3) {
      testCode = testWords.map(word => word.charAt(0)).join('').toUpperCase()
    } else {
      // For longer names, take first letter of first 3 words
      testCode = testWords.slice(0, 3).map(word => word.charAt(0)).join('').toUpperCase()
    }

    // Add random number to ensure uniqueness
    const randomNum = Math.floor(Math.random() * 999) + 1
    const paddedNum = randomNum.toString().padStart(3, '0')
    
    const generatedCode = `${deptCode}-${testCode}${paddedNum}`
    
    setFormData({ ...formData, code: generatedCode })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.department || !formData.code || !formData.category) {
      alert("Please fill in all required fields: name, code, category, and department")
      return
    }

    try {
      await createTest(formData)
      // Reset form on success
      resetForm()
    } catch (error) {
      console.error('Failed to create test:', error)
    }
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
          <form onSubmit={handleFormSubmit} className="space-y-4">
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
              <Label htmlFor="testCode">Test Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="testCode"
                  placeholder="e.g., HEMA-CBC001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateTestCode}
                  disabled={!formData.name || !formData.department}
                  className="whitespace-nowrap"
                >
                  Auto Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Blood Test"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="e.g., 25.50"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description (optional)"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {loading ? 'Adding...' : 'Add Test'}
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
                      {(() => {
                        // Find department by code since test.department is just a string code
                        const dept = departments.find(d => d.code === test.department);
                        const deptName = dept?.name || 'N/A';
                        return (
                          <Badge className={getDepartmentColor(deptName)} variant="secondary">
                            {deptName}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {test.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(test.id)}
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
