"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, X } from "lucide-react"
import { mockLabTests, type LabTest } from "@/lib/lab"

interface LabOrderFormProps {
  onSubmit: (order: any) => void
  onCancel: () => void
}

export function LabOrderForm({ onSubmit, onCancel }: LabOrderFormProps) {
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    priority: "routine",
    notes: "",
  })

  const filteredTests = mockLabTests.filter(
    (test) =>
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalCost = selectedTests.reduce((sum, test) => sum + test.price, 0)

  const handleTestToggle = (test: LabTest, checked: boolean) => {
    if (checked) {
      setSelectedTests([...selectedTests, test])
    } else {
      setSelectedTests(selectedTests.filter((t) => t.id !== test.id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      tests: selectedTests,
      totalCost,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">New Lab Order</h2>
          <p className="text-muted-foreground">Create a new laboratory test order</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedTests.length === 0}>
            Create Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Select Tests</CardTitle>
            <CardDescription>Choose the laboratory tests to order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredTests.map((test) => (
                  <div key={test.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedTests.some((t) => t.id === test.id)}
                      onCheckedChange={(checked) => handleTestToggle(test, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{test.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{test.category}</Badge>
                          <span className="font-medium">${test.price}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Duration: {test.duration}</span>
                        {test.normalRange && <span>Range: {test.normalRange}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Tests Summary */}
      {selectedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{test.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {test.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>${test.price}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTests(selectedTests.filter((t) => t.id !== test.id))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Cost:</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
