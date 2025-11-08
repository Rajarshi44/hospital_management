"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, X, Loader2, User, UserCheck } from "lucide-react"
import { useLab } from "@/hooks/useLab"
import { usePatient, EnhancedPatient } from "@/hooks/usePatient"
import { useDoctor, Doctor } from "@/hooks/doctor/use-doctor"
import { LabTest, Priority, CreateLabOrderRequest } from "@/lib/types/lab.types"

interface LabOrderFormProps {
  patientId?: string
  doctorId?: string
  onSubmit?: (order: any) => void
  onCancel: () => void
}

export function LabOrderForm({ patientId, doctorId, onSubmit, onCancel }: LabOrderFormProps) {
  const { 
    tests, 
    departments,
    loading, 
    createOrder, 
    fetchTests 
  } = useLab()
  
  const { searchPatients } = usePatient()
  const { doctors, fetchDoctors } = useDoctor()
  
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [patientSearchTerm, setPatientSearchTerm] = useState("")
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("")
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [showDoctorSearch, setShowDoctorSearch] = useState(false)
  const [patientSearchLoading, setPatientSearchLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    patientId: patientId || "",
    doctorId: doctorId || "",
    priority: Priority.NORMAL,
    clinicalNotes: "",
    requestedBy: "",
  })

  const filteredTests = tests.filter(
    (test) =>
      test.isActive &&
      (test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       test.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalCost = selectedTests.reduce((sum, test) => sum + test.price, 0)

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
    setFormData({ ...formData, patientId: patient.id })
    setPatientSearchTerm(`${patient.firstName} ${patient.lastName} (${patient.patientId})`)
    setShowPatientSearch(false)
    setPatientSearchResults([])
  }

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setFormData({ ...formData, doctorId: doctor.id, requestedBy: `${doctor.firstName} ${doctor.lastName}` })
    setDoctorSearchTerm(`${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`)
    setShowDoctorSearch(false)
  }

  useEffect(() => {
    if (tests.length === 0) {
      fetchTests()
    }
    if (doctors.length === 0) {
      fetchDoctors()
    }
  }, [])

  // Search patients - Direct API call for testing
  useEffect(() => {
    const searchPatientsDebounced = async () => {
      if (patientSearchTerm.length > 2) {
        console.log('🔍 Searching for patients with term:', patientSearchTerm)
        setPatientSearchLoading(true)
        try {
          // Try direct API call first
          const token = localStorage.getItem('accessToken')
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
          const response = await fetch(`${apiUrl}/patients`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const allPatients = await response.json()
            console.log('📋 All patients from API:', allPatients)
            
            // Filter patients based on search term
            const filtered = allPatients.filter((patient: any) => 
              patient.firstName?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
              patient.lastName?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
              patient.phone?.includes(patientSearchTerm) ||
              patient.patientId?.toLowerCase().includes(patientSearchTerm.toLowerCase())
            )
            
            console.log('🔍 Filtered results:', filtered)
            setPatientSearchResults(filtered)
          } else {
            console.error('❌ API response not ok:', response.status, response.statusText)
            setPatientSearchResults([])
          }
        } catch (error) {
          console.error('❌ Failed to search patients:', error)
          setPatientSearchResults([])
        } finally {
          setPatientSearchLoading(false)
        }
      } else {
        setPatientSearchResults([])
        setPatientSearchLoading(false)
      }
    }

    const timer = setTimeout(searchPatientsDebounced, 300)
    return () => clearTimeout(timer)
  }, [patientSearchTerm])

  // Filter doctors
  useEffect(() => {
    if (doctorSearchTerm.length > 0) {
      const filtered = doctors.filter(doctor => 
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(doctorSearchTerm.toLowerCase())
      )
      setFilteredDoctors(filtered)
    } else {
      setFilteredDoctors(doctors)
    }
  }, [doctorSearchTerm, doctors])

  // Close search dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowPatientSearch(false)
      setShowDoctorSearch(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleTestToggle = (test: LabTest, checked: boolean) => {
    if (checked) {
      setSelectedTests([...selectedTests, test])
    } else {
      setSelectedTests(selectedTests.filter((t) => t.id !== test.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatient || !selectedDoctor || selectedTests.length === 0) {
      alert("Please select a patient, doctor, and at least one test")
      return
    }

    try {
      const orderData: CreateLabOrderRequest = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        testIds: selectedTests.map(test => test.id),
        priority: formData.priority,
        clinicalNotes: formData.clinicalNotes,
        requestedBy: formData.requestedBy,
      }

      const newOrder = await createOrder(orderData)
      onSubmit?.(newOrder)
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">New Lab Order</h2>
          <p className="text-muted-foreground">Create a new laboratory test order</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={selectedTests.length === 0 || loading || !selectedPatient || !selectedDoctor}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <Label htmlFor="patientSearch">Search Patient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="patientSearch"
                  placeholder="Search by name, phone, or patient ID..."
                  value={patientSearchTerm}
                  onChange={(e) => {
                    setPatientSearchTerm(e.target.value)
                    setShowPatientSearch(true)
                  }}
                  onFocus={() => setShowPatientSearch(true)}
                  className="pl-10"
                />
                {showPatientSearch && (patientSearchLoading || patientSearchResults.length > 0 || patientSearchTerm.length > 2) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {patientSearchLoading ? (
                      <div className="p-3 text-center">
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Searching patients...
                      </div>
                    ) : patientSearchResults.length > 0 ? (
                      patientSearchResults.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {patient.patientId} | Phone: {patient.phone}
                              </div>
                            </div>
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted-foreground">
                        No patients found for "{patientSearchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {selectedPatient && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Patient ID: {selectedPatient.patientId} | Phone: {selectedPatient.phone}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(null)
                      setPatientSearchTerm("")
                      setFormData({ ...formData, patientId: "" })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="doctorSearch">Search Doctor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="doctorSearch"
                  placeholder="Search by name or specialization..."
                  value={doctorSearchTerm}
                  onChange={(e) => {
                    setDoctorSearchTerm(e.target.value)
                    setShowDoctorSearch(true)
                  }}
                  onFocus={() => setShowDoctorSearch(true)}
                  className="pl-10"
                />
                {showDoctorSearch && filteredDoctors.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredDoctors.slice(0, 10).map((doctor) => (
                      <div
                        key={doctor.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</div>
                            <div className="text-sm text-muted-foreground">
                              {doctor.specialization} | {doctor.department}
                            </div>
                          </div>
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedDoctor && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </span>
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      {selectedDoctor.specialization} | {selectedDoctor.department}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedDoctor(null)
                      setDoctorSearchTerm("")
                      setFormData({ ...formData, doctorId: "", requestedBy: "" })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.LOW}>Low</SelectItem>
                  <SelectItem value={Priority.NORMAL}>Normal</SelectItem>
                  <SelectItem value={Priority.HIGH}>High</SelectItem>
                  <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clinicalNotes">Clinical Notes</Label>
              <Textarea
                id="clinicalNotes"
                value={formData.clinicalNotes}
                onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
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
                        {test.duration && <span>Duration: {test.duration}</span>}
                        {test.normalRange && <span>Range: {test.normalRange}</span>}
                        {test.sampleType && <span>Sample: {test.sampleType}</span>}
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
