"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  User, Users, Stethoscope, Bed, Heart, DollarSign, FileText, Upload,
  ChevronDown, ChevronUp, Loader2, CheckCircle2, Calendar, Phone, Mail
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { mockDoctors, mockDepartments } from "@/lib/schedule-mock-data"
import { mockWards, getAvailableBeds } from "@/lib/ipd-mock-data"

// Comprehensive schema based on your specification
const enhancedAdmissionSchema = z.object({
  // Patient Basic Information
  uhid: z.string().optional(),
  fullName: z.string().min(2, "Full name is required"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.number().min(0, "Age is calculated from DOB"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),

  // Guardian / Attendant
  guardianName: z.string().min(2, "Guardian name is required"),
  relation: z.string().min(2, "Relation is required"),
  guardianPhone: z.string().min(10, "Guardian contact is required"),
  address: z.string().min(5, "Address is required"),

  // Clinical / Admission Details
  admissionType: z.enum(["Emergency", "Scheduled", "Transfer"], { required_error: "Admission type is required" }),
  reasonForAdmission: z.string().min(10, "Reason for admission is required"),
  admittingDoctor: z.string().min(1, "Primary doctor is required"),
  consultingDoctor: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  speciality: z.string().optional(),

  // Bed / Ward Details
  wardType: z.enum(["General", "Semi-Private", "Private", "ICU", "PICU", "NICU"], { required_error: "Ward type is required" }),
  roomNo: z.string().min(1, "Room number is required"),
  bedNo: z.string().min(1, "Bed number is required"),

  // Medical Background
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  ongoingMedication: z.string().optional(),

  // Payment & Advance
  paymentMode: z.enum(["Cash", "Card", "UPI", "Insurance", "Credit"], { required_error: "Payment mode is required" }),
  advanceAmount: z.number().min(0).optional(),
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  tpaDetails: z.string().optional(),
}).refine(
  (data) => {
    if (data.paymentMode === "Insurance") {
      return data.insuranceProvider && data.policyNumber
    }
    return true
  },
  {
    message: "Insurance provider and policy number are required for insurance payments",
    path: ["insuranceProvider"],
  }
)

type EnhancedAdmissionFormData = z.infer<typeof enhancedAdmissionSchema>

interface EnhancedAdmissionFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function EnhancedAdmissionForm({ onSubmit, onCancel }: EnhancedAdmissionFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<string[]>([])
  const [availableBeds, setAvailableBeds] = useState<any[]>([])

  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    patient: true,
    guardian: false,
    clinical: false,
    bed: false,
    medical: false,
    payment: false,
    documents: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const form = useForm<EnhancedAdmissionFormData>({
    resolver: zodResolver(enhancedAdmissionSchema),
    defaultValues: {
      uhid: `UHID${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: "",
      gender: "Male",
      dob: "",
      age: 0,
      phone: "",
      email: "",
      guardianName: "",
      relation: "",
      guardianPhone: "",
      address: "",
      admissionType: "Scheduled",
      reasonForAdmission: "",
      admittingDoctor: "",
      consultingDoctor: "",
      department: "",
      speciality: "",
      wardType: "General",
      roomNo: "",
      bedNo: "",
      bloodGroup: "",
      allergies: "",
      medicalHistory: "",
      ongoingMedication: "",
      paymentMode: "Cash",
      advanceAmount: 0,
      insuranceProvider: "",
      policyNumber: "",
      tpaDetails: "",
    },
  })

  // Calculate age from DOB
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "dob" && value.dob) {
        const dob = new Date(value.dob)
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        const monthDiff = today.getMonth() - dob.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--
        }
        form.setValue("age", age)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Load beds based on ward type
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "wardType" && value.wardType) {
        const ward = mockWards.find(w => w.name.includes(value.wardType!))
        if (ward) {
          const beds = getAvailableBeds(ward.id)
          setAvailableBeds(beds)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleFormSubmit = async (data: EnhancedAdmissionFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Success!",
        description: `Patient ${data.fullName} has been admitted successfully.`,
      })
      
      onSubmit(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete admission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const paymentMode = form.watch("paymentMode")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Section 1: Patient Basic Information */}
        <Collapsible open={openSections.patient} onOpenChange={() => toggleSection("patient")}>
          <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      1
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Patient Basic Information</CardTitle>
                      <CardDescription>Personal details and identification</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.patient && <Badge variant="secondary" className="text-xs">Click to expand</Badge>}
                    {openSections.patient ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="uhid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UHID</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-muted" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                        <FormLabel>Gender *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Age (auto)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value} readOnly className="bg-muted" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 2: Guardian / Attendant */}
        <Collapsible open={openSections.guardian} onOpenChange={() => toggleSection("guardian")}>
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 font-semibold">
                      2
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Guardian / Attendant</CardTitle>
                      <CardDescription>Emergency contact and guardian details</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.guardian && <Badge variant="secondary" className="text-xs">Click to expand</Badge>}
                    {openSections.guardian ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guardianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relation *</FormLabel>
                        <FormControl>
                          <Input placeholder="Spouse, Parent, Sibling" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardianPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Complete address" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 3: Clinical / Admission Details */}
        <Collapsible open={openSections.clinical} onOpenChange={() => toggleSection("clinical")}>
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 font-semibold">
                      3
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Clinical / Admission Details</CardTitle>
                      <CardDescription>Admission type, doctors, and reason</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.clinical && <Badge variant="secondary" className="text-xs">Click to expand</Badge>}
                    {openSections.clinical ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="admissionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select admission type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Transfer">Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockDepartments.map((dept) => (
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
                    name="admittingDoctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Doctor *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockDoctors.map((doctor) => (
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
                    name="consultingDoctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consulting Doctor (Optional)</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select consulting doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockDoctors.map((doctor) => (
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
                    name="speciality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Speciality</FormLabel>
                        <FormControl>
                          <Input placeholder="Cardiology, Neurology, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reasonForAdmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Admission *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed reason for admission" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 4: Bed / Ward Details */}
        <Collapsible open={openSections.bed} onOpenChange={() => toggleSection("bed")}>
          <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-600 font-semibold">
                      4
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Bed / Ward Details</CardTitle>
                      <CardDescription>Ward type and bed allocation</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.bed && <Badge variant="secondary" className="text-xs">Click to expand</Badge>}
                    {openSections.bed ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="wardType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ward Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ward type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                            <SelectItem value="ICU">ICU</SelectItem>
                            <SelectItem value="PICU">PICU</SelectItem>
                            <SelectItem value="NICU">NICU</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roomNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 101, 201" {...field} />
                        </FormControl>
                        <FormDescription>Enter room number manually</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bedNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bed Number *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bed" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableBeds.filter(bed => !bed.isOccupied).map((bed) => (
                              <SelectItem key={bed.id} value={bed.bedNumber}>
                                {bed.bedNumber} - ₹{bed.chargesPerDay}/day
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Available beds in selected ward</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 5: Medical Background */}
        <Collapsible open={openSections.medical} onOpenChange={() => toggleSection("medical")}>
          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 font-semibold">
                      5
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Medical Background</CardTitle>
                      <CardDescription>Medical history and current medications</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.medical && <Badge variant="secondary" className="text-xs">Click to expand</Badge>}
                    {openSections.medical ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                              <SelectItem key={bg} value={bg}>
                                {bg}
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
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Input placeholder="List known allergies" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Past Medical History</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Previous medical conditions, surgeries, etc." {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ongoingMedication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ongoing Medication</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Current medications and dosages" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 6: Payment & Advance */}
        <Collapsible open={openSections.payment} onOpenChange={() => toggleSection("payment")}>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                      6
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Payment & Advance</CardTitle>
                      <CardDescription>Payment mode and insurance details</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.payment && <Badge variant="secondary" className="text-xs">Click to expand</Badge>}
                    {openSections.payment ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Mode *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="Insurance">Insurance</SelectItem>
                            <SelectItem value="Credit">Credit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="advanceAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {paymentMode === "Insurance" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
                    <h4 className="font-medium text-sm">Insurance Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider *</FormLabel>
                            <FormControl>
                              <Input placeholder="Insurance company name" {...field} />
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
                              <Input placeholder="Policy number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tpaDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TPA Details</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Third Party Administrator details" {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 7: Document Upload */}
        <Collapsible open={openSections.documents} onOpenChange={() => toggleSection("documents")}>
          <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/10 text-pink-600 font-semibold">
                      7
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Document Upload</CardTitle>
                      <CardDescription>Identity proofs and medical documents</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!openSections.documents && <Badge variant="secondary" className="text-xs">Click to expand</Badge>}
                    {openSections.documents ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>ID Proof</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Referral Document</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Insurance Documents</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload multiple files</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB each)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Submit Buttons */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pt-4">
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onCancel} size="lg">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-[160px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Complete Admission
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
