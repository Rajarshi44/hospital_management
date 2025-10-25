"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  User,
  Calendar,
  Stethoscope,
  CreditCard,
  UserPlus,
  Search,
  Save,
  X,
  FileText,
  Clock,
  MapPin,
  Phone,
  Mail,
  Heart,
  AlertCircle,
  Bed,
  DollarSign,
} from "lucide-react"
import { mockPatients, mockDoctors, mockDepartments, Patient } from "@/lib/mock-data"
import { calculateAge, getAvailableBeds } from "@/lib/mock-services"

// Enhanced Schema with all required fields
const admissionSchema = z
  .object({
    // Patient Information
    selectedPatientId: z.string().optional(),
    isNewPatient: z.boolean().default(true),
    fullName: z.string().min(2, "Full name is required"),
    gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    age: z.number().min(0, "Age must be positive"),
    contactNumber: z.string().min(10, "Valid contact number is required"),
    email: z.string().email("Valid email is required").optional().or(z.literal("")),
    address: z.string().min(5, "Address is required"),
    bloodGroup: z.string().min(1, "Blood group is required"),
    allergies: z.string().optional(),
    medicalHistory: z.string().optional(),

    // Admission Details
    admissionDate: z.string().min(1, "Admission date is required"),
    admissionTime: z.string().min(1, "Admission time is required"),
    admissionType: z.enum(["emergency", "planned", "referral"], { required_error: "Admission type is required" }),
    departmentId: z.string().min(1, "Department is required"),
    doctorId: z.string().min(1, "Doctor is required"),
    reasonForAdmission: z.string().min(10, "Reason for admission is required"),
    wardType: z.string().min(1, "Ward type is required"),
    bedNumber: z.string().min(1, "Bed number is required"),
    specialInstructions: z.string().optional(),
    attendantName: z.string().optional(),
    attendantContact: z.string().optional(),

    // Payment & Insurance
    paymentMode: z.enum(["cash", "card", "insurance", "tpa"], { required_error: "Payment mode is required" }),
    insuranceName: z.string().optional(),
    policyNumber: z.string().optional(),
    initialDeposit: z.number().min(0, "Deposit must be positive").optional(),
    billingNotes: z.string().optional(),
  })
  .refine(
    data => {
      if (data.paymentMode === "insurance" || data.paymentMode === "tpa") {
        return data.insuranceName && data.policyNumber
      }
      return true
    },
    {
      message: "Insurance details required for insurance/TPA payments",
      path: ["insuranceName"],
    }
  )

interface ComprehensiveAdmissionFormProps {
  onSubmit?: (data: any) => void
  onCancel?: () => void
}

export function ComprehensiveAdmissionForm({ onSubmit, onCancel }: ComprehensiveAdmissionFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPatients, setFilteredPatients] = useState(mockPatients)
  const [availableBeds, setAvailableBeds] = useState(getAvailableBeds())
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors)

  const form = useForm<z.infer<typeof admissionSchema>>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      isNewPatient: true,
      fullName: "",
      gender: "male",
      dateOfBirth: "",
      age: 0,
      contactNumber: "",
      email: "",
      address: "",
      bloodGroup: "",
      allergies: "",
      medicalHistory: "",
      admissionDate: new Date().toISOString().split("T")[0],
      admissionTime: "09:00",
      admissionType: "planned",
      departmentId: "",
      doctorId: "",
      reasonForAdmission: "",
      wardType: "",
      bedNumber: "",
      specialInstructions: "",
      attendantName: "",
      attendantContact: "",
      paymentMode: "cash",
      insuranceName: "",
      policyNumber: "",
      initialDeposit: 0,
      billingNotes: "",
    },
  })

  // Patient search functionality
  useEffect(() => {
    if (searchQuery) {
      const filtered = mockPatients.filter(
        patient =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone.includes(searchQuery) ||
          patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(mockPatients)
    }
  }, [searchQuery])

  // Auto-fill patient data when selected
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    form.setValue("selectedPatientId", patient.id)
    form.setValue("isNewPatient", false)
    form.setValue("fullName", patient.name)
    form.setValue("contactNumber", patient.phone)
    form.setValue("email", patient.email || "")
    form.setValue("address", patient.address)
    form.setValue("bloodGroup", patient.bloodGroup)
    form.setValue("allergies", patient.allergies || "")
    form.setValue("medicalHistory", patient.medicalHistory || "")

    if (patient.dateOfBirth) {
      form.setValue("dateOfBirth", patient.dateOfBirth)
      form.setValue("age", calculateAge(patient.dateOfBirth))
    }
    if (patient.gender) {
      form.setValue("gender", patient.gender as "male" | "female" | "other")
    }
  }

  // Department change handler
  const handleDepartmentChange = (departmentId: string) => {
    form.setValue("departmentId", departmentId)
    const filtered = mockDoctors.filter(doctor => doctor.departmentId === departmentId)
    setFilteredDoctors(filtered)
    form.setValue("doctorId", "")
  }

  // Ward type change handler
  const handleWardTypeChange = (wardType: string) => {
    form.setValue("wardType", wardType)
    const beds = getAvailableBeds().filter(bed => bed.type === wardType)
    setAvailableBeds(beds)
    form.setValue("bedNumber", "")
  }

  // Calculate age from DOB
  const handleDateOfBirthChange = (date: string) => {
    form.setValue("dateOfBirth", date)
    const age = calculateAge(date)
    form.setValue("age", age)
  }

  // Form submission
  const handleSubmit = async (data: z.infer<typeof admissionSchema>) => {
    setIsSubmitting(true)
    try {
      const admissionId = `ADM${Date.now()}`
      const submissionData = {
        ...data,
        admissionId,
        patientId: selectedPatient?.id || `PAT${Date.now()}`,
        submittedAt: new Date().toISOString(),
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log("Admission Data:", submissionData)

      if (onSubmit) {
        onSubmit(submissionData)
      }
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: "Patient Information", icon: User },
    { number: 2, title: "Admission Details", icon: Stethoscope },
    { number: 3, title: "Payment & Insurance", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IPD Patient Admission</h1>
                <p className="text-gray-600 text-sm">Complete patient admission process</p>
              </div>
            </div>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="text-gray-600">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center space-x-3 ${currentStep >= step.number ? "text-blue-600" : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.number ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.number ? "✓" : step.number}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-24 mx-6 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step 1: Patient Information */}
            {currentStep === 1 && (
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Patient Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Patient Search */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Search Existing Patient</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, phone, or patient ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 h-10"
                      />
                    </div>

                    {searchQuery && filteredPatients.length > 0 && (
                      <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredPatients.slice(0, 5).map(patient => (
                          <div
                            key={patient.id}
                            onClick={() => {
                              handlePatientSelect(patient)
                              setSearchQuery("")
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                <p className="text-sm text-gray-600">
                                  {patient.phone} • {patient.patientId}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {patient.bloodGroup}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Patient Details Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter full name" className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Gender *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Date of Birth *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={e => handleDateOfBirthChange(e.target.value)}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              readOnly
                              className="h-10 bg-gray-50"
                              placeholder="Auto-calculated"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Contact Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter contact number" className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="Enter email" className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Blood Group *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Address *</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter complete address" className="min-h-[80px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Known Allergies</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="List any known allergies" className="min-h-[35px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicalHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Medical History</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Previous medical conditions" className="min-h-[35px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Admission Details */}
            {currentStep === 2 && (
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-green-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <span>Admission Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="admissionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Admission Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="admissionTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Admission Time *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="admissionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Admission Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="emergency">Emergency</SelectItem>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Department *</FormLabel>
                          <Select onValueChange={handleDepartmentChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockDepartments.map(dept => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
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
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Assigned Doctor *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredDoctors.map(doctor => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  Dr. {doctor.name} - {doctor.specialization}
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
                      name="wardType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Ward Type *</FormLabel>
                          <Select onValueChange={handleWardTypeChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select ward type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General Ward</SelectItem>
                              <SelectItem value="private">Private Room</SelectItem>
                              <SelectItem value="semi-private">Semi-Private Room</SelectItem>
                              <SelectItem value="icu">ICU</SelectItem>
                              <SelectItem value="deluxe">Deluxe Room</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bedNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Bed Number *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select bed" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableBeds.map(bed => (
                                <SelectItem key={bed.id} value={bed.number}>
                                  {bed.number} - {bed.type} ({bed.status})
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
                      name="attendantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Attendant Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter attendant name" className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attendantContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Attendant Contact</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter contact number" className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="reasonForAdmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Reason for Admission / Diagnosis *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter reason for admission and preliminary diagnosis"
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="text-sm font-medium text-gray-700">Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Any special care instructions" className="min-h-[60px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment & Insurance */}
            {currentStep === 3 && (
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-purple-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span>Payment & Insurance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Payment Mode *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select payment mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="insurance">Insurance</SelectItem>
                              <SelectItem value="tpa">TPA</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="initialDeposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Initial Deposit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="Enter deposit amount"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Insurance Details - Conditional */}
                  {(form.watch("paymentMode") === "insurance" || form.watch("paymentMode") === "tpa") && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-4 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Insurance / TPA Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="insuranceName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Insurance / TPA Name *
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter insurance provider name" className="h-10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="policyNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Policy Number *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter policy number" className="h-10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="billingNotes"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel className="text-sm font-medium text-gray-700">Billing Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any special billing instructions"
                            className="min-h-[60px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="h-10 px-6"
                    >
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset()
                      setSelectedPatient(null)
                      setCurrentStep(1)
                    }}
                    className="h-10 px-6"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                      <Clock className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-10 px-8 bg-green-600 hover:bg-green-700 min-w-[140px]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Admitting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="h-4 w-4 mr-2" />
                          Admit Patient
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
