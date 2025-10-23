"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createDoctor } from "@/lib/doctor-service"
import type { Doctor } from "@/lib/types"
import { CalendarIcon, Upload, Eye, EyeOff, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// Comprehensive form schema with all steps
const formSchema = z
  .object({
    // Step 1: Personal Information
    profilePhoto: z.string().optional(),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    gender: z.enum(["Male", "Female", "Other"]),
    dateOfBirth: z.date({ required_error: "Date of birth is required" }),
    mobileNumber: z.string().min(10, "Mobile number must be 10 digits"),
    otpVerified: z.boolean().default(false),
    emailAddress: z.string().email("Invalid email address"),
    emergencyContact: z.string().min(10, "Emergency contact must be 10 digits"),
    residentialAddress: z.string().min(10, "Address must be at least 10 characters"),

    // Step 2: Professional Information
    specialization: z.string().min(1, "Specialization is required"),
    subSpecialization: z.string().optional(),
    highestQualification: z.string().min(1, "Qualification is required"),
    universityName: z.string().min(1, "University/College name is required"),
    yearOfPassing: z.number().min(1950).max(new Date().getFullYear()),
    totalExperience: z.number().min(0),
    previousHospitals: z.string().optional(),
    resumeCV: z.string().optional(),

    // Step 3: Medical License & Verification
    medicalCouncilRegNo: z.string().min(1, "Registration number is required"),
    issuingCouncil: z.string().min(1, "Issuing council is required"),
    licenseIssueDate: z.date({ required_error: "License issue date is required" }),
    licenseExpiryDate: z.date({ required_error: "License expiry date is required" }),
    licenseDocument: z.string().optional(),
    idProofDocument: z.string().optional(),

    // Step 4: Hospital Role & Availability
    department: z.string().min(1, "Department is required"),
    roleDesignation: z.string().min(1, "Role/Designation is required"),
    shiftType: z.string().min(1, "Shift type is required"),
    workingDays: z.array(z.string()).min(1, "At least one working day is required"),
    opdStartTime: z.string().min(1, "OPD start time is required"),
    opdEndTime: z.string().min(1, "OPD end time is required"),
    maxPatientsPerDay: z.number().min(1, "Maximum patients per day must be at least 1"),

    // Step 5: Payment & Banking Details
    paymentMode: z.string().min(1, "Payment mode is required"),
    bankAccountNumber: z.string().min(1, "Bank account number is required"),
    ifscCode: z.string().min(11, "IFSC code must be 11 characters").max(11),
    bankName: z.string().min(1, "Bank name is required"),
    branchName: z.string().min(1, "Branch name is required"),
    upiId: z.string().optional(),

    // Step 6: Portal Login & Digital Consent
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    twoFactorAuth: z.boolean().default(false),
    digitalSignature: z.string().optional(),
    declarationAccepted: z.boolean().refine(val => val === true, "Declaration must be accepted"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

interface DoctorRegistrationFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const departments = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Psychiatry",
  "Radiology",
  "Anesthesiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Surgery",
  "Oncology",
  "Gynecology",
  "Urology",
  "Ophthalmology",
]

const specializations = [
  "Cardiology",
  "Interventional Cardiology",
  "Neurology",
  "Pediatric Neurology",
  "Dermatology",
  "Cosmetic Dermatology",
  "Pediatrics",
  "Neonatology",
  "Orthopedic Surgery",
  "Spine Surgery",
  "Psychiatry",
  "Child Psychiatry",
  "Radiology",
  "Interventional Radiology",
  "Anesthesiology",
  "Critical Care",
  "Emergency Medicine",
  "Trauma Surgery",
  "Internal Medicine",
  "Endocrinology",
  "General Surgery",
  "Laparoscopic Surgery",
  "Oncology",
  "Medical Oncology",
  "Gynecology",
  "Obstetrics",
  "Urology",
  "Pediatric Urology",
  "Ophthalmology",
  "Retina",
]

const qualifications = ["MBBS", "MD", "MS", "DM", "MCh", "DNB", "FRCS", "MRCP", "PhD"]

const councils = [
  "Medical Council of India (MCI)",
  "National Medical Commission (NMC)",
  "State Medical Council",
  "Dental Council of India",
  "Indian Medical Association",
]

const roles = [
  "Consultant",
  "Senior Consultant",
  "Surgeon",
  "Senior Surgeon",
  "Resident Doctor",
  "Visiting Doctor",
  "Emergency Physician",
  "Specialist",
]

const shifts = ["Morning", "Evening", "Night", "Rotational", "On-Call"]

const workingDaysOptions = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
]

const paymentModes = ["Monthly Salary", "Per Consultation", "Commission Based", "Contract Based"]

export function DoctorRegistrationForm({ onSuccess, onCancel }: DoctorRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState("step1")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "Male",
      otpVerified: false,
      totalExperience: 0,
      workingDays: [],
      maxPatientsPerDay: 20,
      twoFactorAuth: false,
      declarationAccepted: false,
      yearOfPassing: new Date().getFullYear() - 5,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)

      // Transform form data to Doctor interface
      const [firstName, ...lastNameParts] = data.fullName.split(" ")
      const lastName = lastNameParts.join(" ") || "Doctor"

      const doctorData: Omit<Doctor, "id" | "createdAt" | "updatedAt"> = {
        employeeId: `DOC${Date.now()}`,
        firstName,
        lastName,
        email: data.emailAddress,
        phone: data.mobileNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.residentialAddress,
        specialization: data.specialization,
        subSpecialty: data.subSpecialization,
        department: data.department,
        licenseNumber: data.medicalCouncilRegNo,
        licenseExpiry: data.licenseExpiryDate,
        medicalDegree: data.highestQualification,
        medicalSchool: data.universityName,
        graduationYear: data.yearOfPassing,
        experience: data.totalExperience,
        languagesSpoken: ["English"], // Default
        consultationFee: 0, // Default
        emergencyContact: {
          name: "Emergency Contact",
          relationship: "Family",
          phone: data.emergencyContact,
        },
        schedule: {
          monday: { start: data.opdStartTime, end: data.opdEndTime, isWorking: data.workingDays.includes("monday") },
          tuesday: { start: data.opdStartTime, end: data.opdEndTime, isWorking: data.workingDays.includes("tuesday") },
          wednesday: {
            start: data.opdStartTime,
            end: data.opdEndTime,
            isWorking: data.workingDays.includes("wednesday"),
          },
          thursday: {
            start: data.opdStartTime,
            end: data.opdEndTime,
            isWorking: data.workingDays.includes("thursday"),
          },
          friday: { start: data.opdStartTime, end: data.opdEndTime, isWorking: data.workingDays.includes("friday") },
          saturday: {
            start: data.opdStartTime,
            end: data.opdEndTime,
            isWorking: data.workingDays.includes("saturday"),
          },
          sunday: { start: data.opdStartTime, end: data.opdEndTime, isWorking: data.workingDays.includes("sunday") },
        },
        isActive: true,
        joinDate: new Date(),
        boardCertifications: [],
        publications: [],
        achievements: [],
      }

      await createDoctor(doctorData)

      toast({
        title: "Success",
        description: "Doctor registered successfully and submitted for verification",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register doctor",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendOTP = () => {
    setOtpSent(true)
    toast({
      title: "OTP Sent",
      description: "Verification code sent to your mobile number",
    })
  }

  const verifyOTP = () => {
    form.setValue("otpVerified", true)
    toast({
      title: "Mobile Verified",
      description: "Mobile number verified successfully",
    })
  }

  const validateStep = (step: string): boolean => {
    const values = form.getValues()

    switch (step) {
      case "step1":
        return !!(
          values.fullName &&
          values.gender &&
          values.dateOfBirth &&
          values.mobileNumber &&
          values.emailAddress &&
          values.emergencyContact &&
          values.residentialAddress
        )
      case "step2":
        return !!(
          values.specialization &&
          values.highestQualification &&
          values.universityName &&
          values.yearOfPassing &&
          values.totalExperience !== undefined
        )
      case "step3":
        return !!(
          values.medicalCouncilRegNo &&
          values.issuingCouncil &&
          values.licenseIssueDate &&
          values.licenseExpiryDate
        )
      case "step4":
        return !!(
          values.department &&
          values.roleDesignation &&
          values.shiftType &&
          values.workingDays.length > 0 &&
          values.opdStartTime &&
          values.opdEndTime &&
          values.maxPatientsPerDay
        )
      case "step5":
        return !!(
          values.paymentMode &&
          values.bankAccountNumber &&
          values.ifscCode &&
          values.bankName &&
          values.branchName
        )
      case "step6":
        return !!(values.username && values.password && values.confirmPassword && values.declarationAccepted)
      default:
        return false
    }
  }

  const handleStepChange = (newStep: string) => {
    const currentStepValid = validateStep(currentStep)

    if (currentStepValid && !completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }

    setCurrentStep(newStep)
  }

  const goToNextStep = () => {
    const steps = ["step1", "step2", "step3", "step4", "step5", "step6"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      handleStepChange(steps[currentIndex + 1])
    }
  }

  const goToPreviousStep = () => {
    const steps = ["step1", "step2", "step3", "step4", "step5", "step6"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const renderStepIcon = (step: string) => {
    if (completedSteps.includes(step)) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (step === currentStep) {
      return <AlertCircle className="h-4 w-4 text-blue-600" />
    }
    return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={currentStep} onValueChange={handleStepChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="step1" className="flex items-center gap-2">
              {renderStepIcon("step1")}
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="step2" className="flex items-center gap-2">
              {renderStepIcon("step2")}
              <span className="hidden sm:inline">Professional</span>
            </TabsTrigger>
            <TabsTrigger value="step3" className="flex items-center gap-2">
              {renderStepIcon("step3")}
              <span className="hidden sm:inline">License</span>
            </TabsTrigger>
            <TabsTrigger value="step4" className="flex items-center gap-2">
              {renderStepIcon("step4")}
              <span className="hidden sm:inline">Role</span>
            </TabsTrigger>
            <TabsTrigger value="step5" className="flex items-center gap-2">
              {renderStepIcon("step5")}
              <span className="hidden sm:inline">Banking</span>
            </TabsTrigger>
            <TabsTrigger value="step6" className="flex items-center gap-2">
              {renderStepIcon("step6")}
              <span className="hidden sm:inline">Login</span>
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Personal Information */}
          <TabsContent value="step1" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🔹 Step 1: Personal Information</CardTitle>
                <CardDescription>Basic personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <FormField
                  control={form.control}
                  name="profilePhoto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                          <Button type="button" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>Upload a professional photo (JPG, PNG - Max 2MB)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Male" id="male" />
                            <Label htmlFor="male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Female" id="female" />
                            <Label htmlFor="female">Female</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Other" id="other" />
                            <Label htmlFor="other">Other</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mobile Number with OTP */}
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number *</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input placeholder="+91 98765 43210" {...field} className="flex-1" />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={sendOTP}
                              disabled={!field.value || field.value.length < 10}
                            >
                              {otpSent ? "Resend OTP" : "Send OTP"}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {otpSent && (
                    <div className="flex gap-2">
                      <Input placeholder="Enter 6-digit OTP" className="flex-1" />
                      <Button type="button" variant="outline" onClick={verifyOTP}>
                        Verify
                      </Button>
                    </div>
                  )}

                  {form.watch("otpVerified") && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Mobile number verified</span>
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="doctor@hospital.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emergency Contact */}
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact *</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43211" {...field} />
                      </FormControl>
                      <FormDescription>Contact number for emergencies</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Residential Address */}
                <FormField
                  control={form.control}
                  name="residentialAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residential Address *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Complete residential address with pin code"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Professional Information */}
          <TabsContent value="step2" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🔹 Step 2: Professional Information</CardTitle>
                <CardDescription>Educational qualifications and professional experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specialization */}
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specializations.map(spec => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sub-specialization */}
                <FormField
                  control={form.control}
                  name="subSpecialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Interventional Cardiology" {...field} />
                      </FormControl>
                      <FormDescription>Optional - specific area of expertise</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Highest Qualification */}
                <FormField
                  control={form.control}
                  name="highestQualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Highest Qualification *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select qualification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {qualifications.map(qual => (
                            <SelectItem key={qual} value={qual}>
                              {qual}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* University/College Name */}
                <FormField
                  control={form.control}
                  name="universityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University/College Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Harvard Medical School" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year of Passing */}
                <FormField
                  control={form.control}
                  name="yearOfPassing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Passing *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2020"
                          min={1950}
                          max={new Date().getFullYear()}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Experience */}
                <FormField
                  control={form.control}
                  name="totalExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Experience (Years) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          min={0}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Previous Hospitals */}
                <FormField
                  control={form.control}
                  name="previousHospitals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Hospital(s)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List previous hospitals and duration of service (optional)"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional - Previous work experience</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload Resume/CV */}
                <FormField
                  control={form.control}
                  name="resumeCV"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Resume/CV</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          <span className="text-sm text-muted-foreground">PDF, DOC, DOCX (Max 5MB)</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Medical License & Verification */}
          <TabsContent value="step3" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🔹 Step 3: Medical License & Verification</CardTitle>
                <CardDescription>Medical registration and identification documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Medical Council Registration No. */}
                <FormField
                  control={form.control}
                  name="medicalCouncilRegNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Council Registration No. *</FormLabel>
                      <FormControl>
                        <Input placeholder="MCI/12345/2020" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Issuing Council/Board */}
                <FormField
                  control={form.control}
                  name="issuingCouncil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Council/Board *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issuing council" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {councils.map(council => (
                            <SelectItem key={council} value={council}>
                              {council}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* License Issue Date */}
                <FormField
                  control={form.control}
                  name="licenseIssueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>License Issue Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* License Expiry Date */}
                <FormField
                  control={form.control}
                  name="licenseExpiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>License Expiry Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload License/Certificate */}
                <FormField
                  control={form.control}
                  name="licenseDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload License/Certificate</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          <span className="text-sm text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ID Proof */}
                <FormField
                  control={form.control}
                  name="idProofDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Proof (Aadhaar/PAN/Passport)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          <span className="text-sm text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Hospital Role & Availability */}
          <TabsContent value="step4" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🔹 Step 4: Hospital Role & Availability</CardTitle>
                <CardDescription>Department assignment and working schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role/Designation */}
                <FormField
                  control={form.control}
                  name="roleDesignation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role / Designation *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shift Type */}
                <FormField
                  control={form.control}
                  name="shiftType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shifts.map(shift => (
                            <SelectItem key={shift} value={shift}>
                              {shift}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Working Days */}
                <FormField
                  control={form.control}
                  name="workingDays"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Working Days *</FormLabel>
                        <FormDescription>Select the days you will be available</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {workingDaysOptions.map(item => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="workingDays"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={checked => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(field.value?.filter(value => value !== item.id))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* OPD/Consultation Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="opdStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OPD Start Time *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="time" {...field} />
                            <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="opdEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OPD End Time *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="time" {...field} />
                            <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Max Patients per Day */}
                <FormField
                  control={form.control}
                  name="maxPatientsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Patients per Day *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          min={1}
                          max={100}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Maximum number of patients you can see per day</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Payment & Banking Details */}
          <TabsContent value="step5" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🔹 Step 5: Payment & Banking Details</CardTitle>
                <CardDescription>Salary and banking information for payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                          {paymentModes.map(mode => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bank Account Number */}
                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* IFSC Code */}
                <FormField
                  control={form.control}
                  name="ifscCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="SBIN0001234" {...field} style={{ textTransform: "uppercase" }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bank Name */}
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="State Bank of India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Branch Name */}
                <FormField
                  control={form.control}
                  name="branchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Branch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* UPI ID */}
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="doctor@paytm" {...field} />
                      </FormControl>
                      <FormDescription>For quick payments and consultations</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 6: Portal Login & Digital Consent */}
          <TabsContent value="step6" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🔹 Step 6: Portal Login & Digital Consent</CardTitle>
                <CardDescription>Create login credentials and digital authorization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="dr.johnsmith" {...field} />
                      </FormControl>
                      <FormDescription>Unique username for portal login</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create strong password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>Minimum 8 characters with letters, numbers and symbols</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Two-Factor Authentication */}
                <FormField
                  control={form.control}
                  name="twoFactorAuth"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Two-Factor Authentication</FormLabel>
                        <FormDescription>Add extra security to your account with SMS verification</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Digital Signature */}
                <FormField
                  control={form.control}
                  name="digitalSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Digital Signature (for e-Prescription)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            PNG, JPG (Max 1MB, Transparent background preferred)
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>Digital signature for electronic prescriptions and documents</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Declaration Checkbox */}
                <FormField
                  control={form.control}
                  name="declarationAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Declaration & Consent *</FormLabel>
                        <FormDescription className="text-sm">
                          I hereby confirm that all the information provided is true and accurate to the best of my
                          knowledge. I understand that any false information may lead to rejection of my application or
                          termination of services. I consent to the processing of my personal data for registration and
                          hospital management purposes.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons Footer */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={currentStep === "step1"}>
              Back
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel / Reset
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStep !== "step6" ? (
              <Button type="button" onClick={goToNextStep} disabled={!validateStep(currentStep)}>
                Save & Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !form.watch("declarationAccepted")}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
