"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  CalendarDays,
  Clock,
  Stethoscope,
  Bed,
  User,
  DollarSign,
  Save,
  X,
  Search,
  UserPlus,
  Upload,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileText,
  CreditCard,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { mockOPDPatients, mockWards, mockBeds, getAvailableBeds } from "@/lib/ipd-mock-data"
import { mockDoctors, mockDepartments } from "@/lib/schedule-mock-data"
import { Patient } from "@/lib/ipd-types"
import { NewPatientForm } from "./new-patient-form"

// Comprehensive admission form schema
const comprehensiveAdmissionSchema = z
  .object({
    // Patient Information
    selectedPatientId: z.string().optional(),
    isNewPatient: z.boolean().default(false),
    fullName: z.string().min(2, "Full name is required"),
    gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    age: z.number().min(0, "Age must be positive"),
    contactNumber: z.string().min(10, "Valid contact number is required"),
    email: z.string().email("Valid email required").optional().or(z.literal("")),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
    allergies: z.string().optional(),
    medicalHistory: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactNumber: z.string().optional(),

    // Admission Details
    admissionDate: z.string().min(1, "Admission date is required"),
    admissionTime: z.string().min(1, "Admission time is required"),
    admissionType: z.enum(["emergency", "planned", "referral"], { required_error: "Admission type is required" }),
    departmentId: z.string().min(1, "Department is required"),
    assignedDoctorId: z.string().min(1, "Assigned doctor is required"),
    reasonForAdmission: z.string().min(10, "Reason for admission is required (minimum 10 characters)"),
    wardType: z.string().min(1, "Ward type is required"),
    bedId: z.string().min(1, "Bed selection is required"),
    specialInstructions: z.string().optional(),
    attendantName: z.string().optional(),
    attendantContact: z.string().optional(),
    consentFormRequired: z.boolean().default(false),

    // Payment & Insurance
    paymentMode: z.enum(["cash", "card", "insurance", "tpa"], { required_error: "Payment mode is required" }),
    insuranceName: z.string().optional(),
    policyNumber: z.string().optional(),
    initialDeposit: z.number().min(0, "Deposit must be positive").optional(),
    billingNotes: z.string().optional(),
  })
  .refine(
    data => {
      // Insurance fields required if payment mode is insurance/TPA
      if (data.paymentMode === "insurance" || data.paymentMode === "tpa") {
        return data.insuranceName && data.policyNumber
      }
      return true
    },
    {
      message: "Insurance name and policy number are required for insurance/TPA payments",
      path: ["insuranceName"],
    }
  )
  .refine(
    data => {
      // Admission date cannot be in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const admissionDate = new Date(data.admissionDate)
      return admissionDate >= today
    },
    {
      message: "Admission date cannot be in the past",
      path: ["admissionDate"],
    }
  )

interface ComprehensiveAdmissionFormProps {
  onSubmit?: (data: any) => void
  onCancel?: () => void
}

export function ComprehensiveAdmissionForm({ onSubmit, onCancel }: ComprehensiveAdmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [availableBeds, setAvailableBeds] = useState(getAvailableBeds())
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors)
  const [patientSearchOpen, setPatientSearchOpen] = useState(false)

  // Section collapse states
  const [patientInfoOpen, setPatientInfoOpen] = useState(true)
  const [admissionDetailsOpen, setAdmissionDetailsOpen] = useState(false)
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false)

  const { toast } = useToast()

  const form = useForm<z.infer<typeof comprehensiveAdmissionSchema>>({
    resolver: zodResolver(comprehensiveAdmissionSchema),
    defaultValues: {
      selectedPatientId: "",
      isNewPatient: false,
      fullName: "",
      gender: undefined,
      dateOfBirth: "",
      age: 0,
      contactNumber: "",
      email: "",
      address: "",
      bloodGroup: "",
      allergies: "",
      medicalHistory: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      admissionDate: new Date().toISOString().split("T")[0],
      admissionTime: new Date().toTimeString().slice(0, 5),
      admissionType: undefined,
      departmentId: "",
      assignedDoctorId: "",
      reasonForAdmission: "",
      wardType: "",
      bedId: "",
      specialInstructions: "",
      attendantName: "",
      attendantContact: "",
      consentFormRequired: false,
      paymentMode: undefined,
      insuranceName: "",
      policyNumber: "",
      initialDeposit: 0,
      billingNotes: "",
    },
  })

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    if (!dob) return 0
    const today = new Date()
    const birthDate = new Date(dob)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age
  }

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    form.setValue("selectedPatientId", patient.id)
    form.setValue("fullName", patient.name)
    form.setValue("gender", patient.gender)
    form.setValue("contactNumber", patient.phone)
    form.setValue("email", patient.email || "")
    form.setValue("address", patient.address || "")
    form.setValue("bloodGroup", patient.bloodGroup || "")
    form.setValue("allergies", patient.allergies?.join(", ") || "")
    form.setValue("medicalHistory", patient.medicalHistory || "")
    form.setValue("emergencyContactName", patient.emergencyContact?.name || "")
    form.setValue("emergencyContactNumber", patient.emergencyContact?.phone || "")
    form.setValue("age", patient.age)
    setPatientSearchOpen(false)

    // Auto-expand admission details section
    setPatientInfoOpen(false)
    setAdmissionDetailsOpen(true)
  }

  // Handle department change
  const handleDepartmentChange = (departmentId: string) => {
    form.setValue("departmentId", departmentId)
    form.setValue("assignedDoctorId", "") // Reset doctor selection

    // Filter doctors by department
    const filtered = mockDoctors.filter(doctor => doctor.departmentId === departmentId)
    setFilteredDoctors(filtered)
  }

  // Handle ward type change
  const handleWardTypeChange = (wardType: string) => {
    form.setValue("wardType", wardType)
    form.setValue("bedId", "") // Reset bed selection

    // Filter available beds by ward type
    const filtered = getAvailableBeds().filter(bed => bed.type === wardType)
    setAvailableBeds(filtered)
  }

  // Handle admission type change
  const handleAdmissionTypeChange = (type: string) => {
    form.setValue("admissionType", type as "emergency" | "planned" | "referral")
    form.setValue("consentFormRequired", type === "planned" || type === "referral")
  }

  // Handle new patient creation
  const handleNewPatientCreated = (newPatient: Patient) => {
    handlePatientSelect(newPatient)
    setShowNewPatientModal(false)
    toast({
      title: "Patient Created",
      description: "New patient has been registered successfully.",
    })
  }

  // Form submission
  const handleSubmit = async (data: z.infer<typeof comprehensiveAdmissionSchema>) => {
    setIsSubmitting(true)
    try {
      // Generate admission ID
      const admissionId = `ADM${Date.now()}`

      const submissionData = {
        ...data,
        admissionId,
        patientId: selectedPatient?.id || `PAT${Date.now()}`,
        submittedAt: new Date().toISOString(),
      }

      console.log("Admission Form Submitted:", submissionData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: "Admission Successful",
        description: `Patient admitted successfully. Admission ID: ${admissionId}`,
      })

      if (onSubmit) {
        onSubmit(submissionData)
      }

      // Reset form
      form.reset()
      setSelectedPatient(null)
      setPatientInfoOpen(true)
      setAdmissionDetailsOpen(false)
      setPaymentDetailsOpen(false)
    } catch (error) {
      console.error("Admission failed:", error)
      toast({
        title: "Admission Failed",
        description: "There was an error processing the admission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-none mx-auto space-y-6 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen p-1">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-4 mx-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IPD Patient Admission</h1>
                <p className="text-slate-600 text-base">Complete patient admission workflow</p>
              </div>
            </div>
          </div>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="h-12 px-6 text-slate-600 border-slate-300 hover:bg-slate-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                patientInfoOpen
                  ? "bg-blue-500 border-blue-500 text-white"
                  : selectedPatient
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-slate-300 text-slate-400"
              }`}
            >
              <span className="text-sm font-semibold">1</span>
            </div>
            <div
              className={`h-1 w-20 rounded-full transition-all duration-300 ${
                selectedPatient ? "bg-green-500" : "bg-slate-200"
              }`}
            />

            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                admissionDetailsOpen
                  ? "bg-blue-500 border-blue-500 text-white"
                  : form.watch("reasonForAdmission")
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-slate-300 text-slate-400"
              }`}
            >
              <span className="text-sm font-semibold">2</span>
            </div>
            <div
              className={`h-1 w-20 rounded-full transition-all duration-300 ${
                form.watch("reasonForAdmission") ? "bg-green-500" : "bg-slate-200"
              }`}
            />

            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                paymentDetailsOpen
                  ? "bg-blue-500 border-blue-500 text-white"
                  : form.watch("paymentMode")
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-slate-300 text-slate-400"
              }`}
            >
              <span className="text-sm font-semibold">3</span>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Section 1: Patient Information */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm mx-2">
            <Collapsible open={patientInfoOpen} onOpenChange={setPatientInfoOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 p-6">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">Patient Information</h3>
                        <p className="text-slate-600 text-sm">Search existing patient or register new patient</p>
                      </div>
                      {selectedPatient && (
                        <Badge
                          variant="secondary"
                          className="ml-3 px-3 py-1 text-xs font-medium bg-green-100 text-green-800 border-green-200"
                        >
                          ✓ {selectedPatient.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPatient && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
                      {patientInfoOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-6 p-4 pt-0">
                  {/* Enhanced Patient Search */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Search className="h-5 w-5 text-blue-500" />
                      <Label className="text-lg font-semibold text-slate-800">Search Existing Patient</Label>
                    </div>
                    <div className="flex gap-4">
                      <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={patientSearchOpen}
                            className="flex-1 justify-between h-14 text-lg border-2 border-slate-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Search className="h-5 w-5 text-slate-400" />
                              <span className="text-slate-600">
                                {selectedPatient ? selectedPatient.name : "Search by UHID, Name, or Contact..."}
                              </span>
                            </div>
                            <ChevronDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[600px] p-0 shadow-2xl border-0 rounded-2xl">
                          <Command className="rounded-2xl">
                            <CommandInput placeholder="Search patients..." className="h-14 text-lg" />
                            <CommandEmpty>
                              <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <UserPlus className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="text-lg text-slate-600 mb-4">No patient found</p>
                                <Button
                                  size="lg"
                                  onClick={() => {
                                    setShowNewPatientModal(true)
                                    setPatientSearchOpen(false)
                                  }}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                  <UserPlus className="h-5 w-5 mr-2" />
                                  Register New Patient
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {mockOPDPatients.map(patient => (
                                <CommandItem
                                  key={patient.id}
                                  onSelect={() => handlePatientSelect(patient)}
                                  className="cursor-pointer p-4 hover:bg-blue-50 transition-colors"
                                >
                                  <div className="flex items-center gap-4 w-full">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                                      <User className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-lg text-slate-900">{patient.name}</div>
                                      <div className="text-sm text-slate-600">
                                        UHID: {patient.uhid} • {patient.phone} • Age: {patient.age}
                                      </div>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewPatientModal(true)}
                        className="h-14 px-8 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                      >
                        <UserPlus className="h-5 w-5 mr-2" />
                        New Patient
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-8">
                    <div className="flex items-center gap-3 mb-6">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <Label className="text-lg font-semibold text-slate-800">Patient Details</Label>
                    </div>
                  </div>

                  {/* Enhanced Patient Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter patient's full name"
                              {...field}
                              className="h-10 text-base border-2 border-slate-200 focus:border-blue-400 rounded-lg transition-colors"
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
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Contact Number *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1-555-0123"
                              {...field}
                              className="h-10 text-base border-2 border-slate-200 focus:border-blue-400 rounded-lg transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-sm font-medium text-slate-700">Gender *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-8"
                            >
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="male" id="male" className="h-5 w-5" />
                                <Label htmlFor="male" className="text-lg font-medium text-slate-700">
                                  Male
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="female" id="female" className="h-5 w-5" />
                                <Label htmlFor="female" className="text-lg font-medium text-slate-700">
                                  Female
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="other" id="other" className="h-5 w-5" />
                                <Label htmlFor="other" className="text-lg font-medium text-slate-700">
                                  Other
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="patient@email.com"
                              {...field}
                              className="h-10 text-base border-2 border-slate-200 focus:border-blue-400 rounded-lg transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Date of Birth *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={e => {
                                field.onChange(e.target.value)
                                const age = calculateAge(e.target.value)
                                form.setValue("age", age)
                              }}
                              className="h-10 text-base border-2 border-slate-200 focus:border-blue-400 rounded-lg transition-colors"
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
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Auto-calculated from DOB"
                              {...field}
                              readOnly
                              className="h-10 text-base bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Blood Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-base border-2 border-slate-200 focus:border-blue-400 rounded-lg">
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
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

                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Emergency contact full name"
                              {...field}
                              className="h-10 text-base border-2 border-slate-200 focus:border-blue-400 rounded-lg transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700">Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Complete address with city, state, and zip code"
                              className="min-h-[120px] text-lg border-2 border-slate-200 focus:border-blue-400 rounded-lg resize-none transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Known Allergies / Medical History
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List any known allergies or relevant medical history"
                                className="min-h-[120px] text-lg border-2 border-slate-200 focus:border-blue-400 rounded-lg resize-none transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContactNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-slate-700">
                              Emergency Contact Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1-555-0123"
                                {...field}
                                className="h-10 text-base border-2 border-slate-200 focus:border-blue-400 rounded-lg transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      type="button"
                      className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-lg transition-all duration-200"
                      onClick={() => {
                        setPatientInfoOpen(false)
                        setAdmissionDetailsOpen(true)
                      }}
                    >
                      Continue to Admission Details
                      <ChevronDown className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* New Patient Modal */}
          <Dialog open={showNewPatientModal} onOpenChange={setShowNewPatientModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
              </DialogHeader>
              <NewPatientForm onPatientCreated={handleNewPatientCreated} />
            </DialogContent>
          </Dialog>

          {/* Section 2: Admission Details */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm mx-2">
            <Collapsible open={admissionDetailsOpen} onOpenChange={setAdmissionDetailsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 p-6">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">Admission Details</h3>
                        <p className="text-slate-600 text-sm">Medical information and bed assignment</p>
                      </div>
                      {form.watch("reasonForAdmission") && (
                        <Badge
                          variant="secondary"
                          className="ml-3 px-3 py-1 text-xs font-medium bg-green-100 text-green-800 border-green-200"
                        >
                          ✓ Details Complete
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {form.watch("reasonForAdmission") && (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                      {admissionDetailsOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-4 p-4">
                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="admissionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} min={new Date().toISOString().split("T")[0]} />
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
                          <FormLabel>Admission Time *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Admission Type */}
                  <FormField
                    control={form.control}
                    name="admissionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Type *</FormLabel>
                        <Select onValueChange={handleAdmissionTypeChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select admission type" />
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

                  {/* Department & Doctor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department *</FormLabel>
                          <Select onValueChange={handleDepartmentChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                      name="assignedDoctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned Doctor *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                  </div>

                  {/* Reason for Admission */}
                  <FormField
                    control={form.control}
                    name="reasonForAdmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Admission / Preliminary Diagnosis *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the reason for admission and preliminary diagnosis"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ward & Bed Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="wardType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ward / Bed Type *</FormLabel>
                          <Select onValueChange={handleWardTypeChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ward type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General Ward</SelectItem>
                              <SelectItem value="private">Private Room</SelectItem>
                              <SelectItem value="icu">ICU</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bedId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bed Number *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select available bed" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableBeds.map(bed => (
                                <SelectItem key={bed.id} value={bed.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>Bed {bed.bedNumber}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {bed.wardName}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                              {availableBeds.length === 0 && (
                                <SelectItem value="" disabled>
                                  No beds available for selected ward type
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Special Instructions */}
                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special care instructions or notes"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Attendant Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="attendantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attendant / Guardian Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of attendant or guardian" {...field} />
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
                          <FormLabel>Attendant Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1-555-0123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Consent Form Upload - Conditional */}
                  {form.watch("consentFormRequired") && (
                    <FormField
                      control={form.control}
                      name="consentFormRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consent Form Upload</FormLabel>
                          <FormControl>
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                              <div className="text-sm text-muted-foreground">
                                <Button variant="outline" size="sm" type="button">
                                  Upload Consent Form
                                </Button>
                                <p className="mt-2">Required for planned/referral admissions</p>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      setAdmissionDetailsOpen(false)
                      setPaymentDetailsOpen(true)
                    }}
                  >
                    Continue to Payment Details
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Section 3: Payment & Insurance Details */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm mx-2">
            <Collapsible open={paymentDetailsOpen} onOpenChange={setPaymentDetailsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300 p-6">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">Payment & Insurance Details</h3>
                        <p className="text-slate-600 text-sm">Billing details and insurance coverage</p>
                      </div>
                      {form.watch("paymentMode") && (
                        <Badge
                          variant="secondary"
                          className="ml-3 px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 border-purple-200"
                        >
                          ✓ Payment Complete
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {form.watch("paymentMode") && (
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                      )}
                      {paymentDetailsOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-4 p-4">
                  {/* Payment Mode */}
                  <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Mode *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Cash
                              </div>
                            </SelectItem>
                            <SelectItem value="card">
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Card
                              </div>
                            </SelectItem>
                            <SelectItem value="insurance">
                              <div className="flex items-center">
                                <Shield className="h-4 w-4 mr-2" />
                                Insurance
                              </div>
                            </SelectItem>
                            <SelectItem value="tpa">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                TPA
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Insurance/TPA Details - Conditional */}
                  {(form.watch("paymentMode") === "insurance" || form.watch("paymentMode") === "tpa") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/50">
                      <FormField
                        control={form.control}
                        name="insuranceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance / TPA Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter insurance company name" {...field} />
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
                            <FormLabel>Policy Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter policy number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Initial Deposit */}
                  <FormField
                    control={form.control}
                    name="initialDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Deposit Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Billing Notes */}
                  <FormField
                    control={form.control}
                    name="billingNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional billing notes or special instructions"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Enhanced Submit Buttons */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-4 mx-2">
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setSelectedPatient(null)
                  setPatientInfoOpen(true)
                  setAdmissionDetailsOpen(false)
                  setPaymentDetailsOpen(false)
                }}
                className="h-12 px-6 text-base border-2 border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 mr-2" />
                Reset Form
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-8 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg shadow-lg transition-all duration-200 min-w-[180px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                    Admitting Patient...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="h-5 w-5 mr-3" />
                    Admit Patient
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
