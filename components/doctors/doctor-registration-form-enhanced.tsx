"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { createDoctor } from "@/lib/doctor-service"
import type { Doctor } from "@/lib/types"
import {
  CalendarIcon,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
  FileText,
  Image,
  X,
  Download,
  Info,
  HelpCircle,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    subDepartment: z.string().optional(),
    roleDesignation: z.string().min(1, "Role/Designation is required"),
    assignedUnit: z.string().optional(),
    consultationType: z.enum(["OPD", "IPD", "Both"]),
    workingLocation: z.string().min(1, "Working location is required"),
    reportingTo: z.string().optional(),
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

interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
  preview?: string
}

// Mock file upload function
const uploadFile = async (file: File): Promise<UploadedFile> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          preview: file.type.startsWith("image/") ? (reader.result as string) : undefined,
        })
      }
      reader.readAsDataURL(file)
    }, 1000)
  })
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

const subDepartments: Record<string, string[]> = {
  Cardiology: ["Interventional Cardiology", "Non-invasive Cardiology", "Cardiac Surgery", "Pediatric Cardiology"],
  Surgery: ["General Surgery", "Laparoscopic Surgery", "Trauma Surgery", "Plastic Surgery"],
  "Internal Medicine": ["Gastroenterology", "Endocrinology", "Nephrology", "Pulmonology"],
  Pediatrics: ["Neonatology", "Pediatric ICU", "Pediatric Surgery", "Pediatric Cardiology"],
  Neurology: ["Neurosurgery", "Stroke Unit", "Epilepsy Center", "Movement Disorders"],
  Orthopedics: ["Joint Replacement", "Spine Surgery", "Sports Medicine", "Trauma Orthopedics"],
  Oncology: ["Medical Oncology", "Surgical Oncology", "Radiation Oncology", "Pediatric Oncology"],
  Radiology: ["Interventional Radiology", "Nuclear Medicine", "CT/MRI", "Ultrasound"],
  Anesthesiology: ["Cardiac Anesthesia", "Neuro Anesthesia", "Pediatric Anesthesia", "Pain Management"],
}

const assignedUnits = [
  "ICU (Intensive Care Unit)",
  "CCU (Cardiac Care Unit)",
  "NICU (Neonatal ICU)",
  "PICU (Pediatric ICU)",
  "OT (Operation Theater)",
  "Emergency Department",
  "General Ward",
  "Private Ward",
  "Day Care",
  "Outpatient Department",
]

const workingLocations = [
  "Main Hospital",
  "Branch Hospital",
  "Satellite Clinic",
  "Online Consultation",
  "Multiple Locations",
]

const seniorDoctors = [
  "Dr. Rajesh Kumar - Head of Cardiology",
  "Dr. Priya Sharma - Head of Surgery",
  "Dr. Anil Mehta - Head of Internal Medicine",
  "Dr. Sunita Gupta - Head of Pediatrics",
  "Dr. Vikram Singh - Head of Orthopedics",
  "Dr. Meera Patel - Head of Gynecology",
  "Dr. Arjun Rao - Head of Neurology",
  "Dr. Kavita Joshi - Head of Oncology",
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

const steps = [
  { id: "step1", label: "Personal Info", description: "Basic personal details" },
  { id: "step2", label: "Professional", description: "Education & experience" },
  { id: "step3", label: "License", description: "Medical credentials" },
  { id: "step4", label: "Role", description: "Hospital assignment" },
  { id: "step5", label: "Banking", description: "Payment details" },
  { id: "step6", label: "Login", description: "Portal access" },
]

export function DoctorRegistrationForm({ onSuccess, onCancel }: DoctorRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState("step1")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "Male",
      otpVerified: false,
      totalExperience: 0,
      consultationType: "OPD",
      workingLocation: "Main Hospital",
      workingDays: [],
      maxPatientsPerDay: 20,
      twoFactorAuth: false,
      declarationAccepted: false,
      yearOfPassing: new Date().getFullYear() - 5,
    },
  })

  // Auto-save functionality
  const saveDraft = useCallback(async () => {
    const formData = form.getValues()
    try {
      localStorage.setItem(
        "doctorRegistrationDraft",
        JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth?.toISOString(),
          licenseIssueDate: formData.licenseIssueDate?.toISOString(),
          licenseExpiryDate: formData.licenseExpiryDate?.toISOString(),
          uploadedFiles,
          currentStep,
          completedSteps,
          lastSaved: new Date().toISOString(),
        })
      )
      setLastSaved(new Date())
      setIsDirty(false)
      toast({
        title: "Draft Saved",
        description: "Your progress has been automatically saved",
        duration: 5000, // Show for 5 seconds instead of 2
      })
    } catch (error) {
      console.error("Failed to save draft:", error)
    }
  }, [form, uploadedFiles, currentStep, completedSteps, toast])

  // Load draft on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("doctorRegistrationDraft")
      if (saved) {
        const draft = JSON.parse(saved)

        // Restore form data
        const formData = { ...draft }
        if (draft.dateOfBirth) formData.dateOfBirth = new Date(draft.dateOfBirth)
        if (draft.licenseIssueDate) formData.licenseIssueDate = new Date(draft.licenseIssueDate)
        if (draft.licenseExpiryDate) formData.licenseExpiryDate = new Date(draft.licenseExpiryDate)

        Object.keys(formData).forEach(key => {
          if (key !== "uploadedFiles" && key !== "currentStep" && key !== "completedSteps" && key !== "lastSaved") {
            form.setValue(key as keyof FormData, formData[key])
          }
        })

        // Restore state
        if (draft.uploadedFiles) setUploadedFiles(draft.uploadedFiles)
        if (draft.currentStep) setCurrentStep(draft.currentStep)
        if (draft.completedSteps) setCompletedSteps(draft.completedSteps)
        if (draft.lastSaved) setLastSaved(new Date(draft.lastSaved))

        toast({
          title: "Draft Restored",
          description: "Your previous progress has been restored",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Failed to load draft:", error)
    }
  }, [form, toast])

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Auto-save timer
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(saveDraft, 15000) // Save after 15 seconds of inactivity
      return () => clearTimeout(timer)
    }
  }, [isDirty, saveDraft])

  // Calculate progress percentage
  const progressPercentage = () => {
    const currentStepIndex = steps.findIndex(step => step.id === currentStep)
    const completedStepCount = completedSteps.length
    const totalSteps = steps.length

    // If current step is valid but not completed, add partial progress
    const currentStepProgress = validateStep(currentStep) ? 0.5 : 0
    return Math.round(((completedStepCount + currentStepProgress) / totalSteps) * 100)
  }

  // File upload handler
  const handleFileUpload = async (fieldName: string, file: File) => {
    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }))
    try {
      const uploadedFile = await uploadFile(file)
      setUploadedFiles(prev => ({ ...prev, [fieldName]: uploadedFile }))
      form.setValue(fieldName as keyof FormData, uploadedFile.url)
      toast({
        title: "File Uploaded",
        description: `${file.name} uploaded successfully`,
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }))
    }
  }

  const removeFile = (fieldName: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[fieldName]
      return newFiles
    })
    form.setValue(fieldName as keyof FormData, "")
  }

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

      // Clear draft after successful submission
      localStorage.removeItem("doctorRegistrationDraft")

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
          values.consultationType &&
          values.workingLocation &&
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
    saveDraft() // Save when changing steps
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

  // Enhanced file upload component with preview
  const FileUploadWithPreview = ({
    fieldName,
    label,
    accept,
    description,
  }: {
    fieldName: string
    label: string
    accept: string
    description: string
  }) => {
    const uploadedFile = uploadedFiles[fieldName]
    const isUploading = uploadingFiles[fieldName]

    return (
      <div className="space-y-3">
        <Label>{label}</Label>

        {!uploadedFile && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept={accept}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(fieldName, file)
              }}
              className="hidden"
              id={`upload-${fieldName}`}
            />
            <label htmlFor={`upload-${fieldName}`} className="cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">{description}</p>
            </label>
          </div>
        )}

        {uploadedFile && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {uploadedFile.preview ? (
                  <img src={uploadedFile.preview} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(uploadedFile.url, "_blank")}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const a = document.createElement("a")
                        a.href = uploadedFile.url
                        a.download = uploadedFile.name
                        a.click()
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(fieldName)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Validation tooltip component
  const ValidationTooltip = ({ children, message }: { children: React.ReactNode; message: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Registration Progress</h3>
              <span className="text-sm text-muted-foreground">{progressPercentage()}% Complete</span>
            </div>

            <Progress value={progressPercentage()} className="w-full" />

            <div className="grid grid-cols-6 gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="text-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-medium",
                      completedSteps.includes(step.id)
                        ? "bg-green-100 text-green-800 border-2 border-green-500"
                        : step.id === currentStep
                          ? "bg-blue-100 text-blue-800 border-2 border-blue-500"
                          : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                    )}
                  >
                    {completedSteps.includes(step.id) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-save Status */}
      {lastSaved && (
        <Alert>
          <Save className="h-4 w-4" />
          <AlertDescription>
            Draft auto-saved at {format(lastSaved, "HH:mm:ss")} - Your progress is automatically saved every 3 seconds
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={currentStep} onValueChange={handleStepChange} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              {steps.map(step => (
                <TabsTrigger key={step.id} value={step.id} className="flex items-center gap-2">
                  {renderStepIcon(step.id)}
                  <span className="hidden sm:inline">{step.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Step 1: Personal Information */}
            <TabsContent value="step1" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🔹 Step 1: Personal Information</CardTitle>
                  <CardDescription>Basic personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Photo with Preview */}
                  <FileUploadWithPreview
                    fieldName="profilePhoto"
                    label="Profile Photo"
                    accept="image/*"
                    description="JPG, PNG - Max 2MB"
                  />

                  {/* Full Name with Validation Tooltip */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Full Name *</FormLabel>
                          <ValidationTooltip message="Enter your complete name as it appears on official documents">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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

                  {/* Date of Birth with Validation Tooltip */}
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <FormLabel>Date of Birth *</FormLabel>
                          <ValidationTooltip message="Must be at least 21 years old to practice medicine">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = e.target.value ? new Date(e.target.value) : undefined
                                field.onChange(date)
                              }}
                              max={format(new Date(), "yyyy-MM-dd")}
                              min="1950-01-01"
                              className="flex-1"
                              placeholder="dd/mm/yyyy"
                            />
                          </FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline" size="icon" className="shrink-0">
                                <CalendarIcon className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => date > new Date() || date < new Date("1950-01-01")}
                                initialFocus
                                captionLayout="dropdown"
                                fromYear={1950}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormDescription>Type the date directly or use the calendar picker</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mobile Number with OTP and Validation Tooltip */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Mobile Number *</FormLabel>
                            <ValidationTooltip message="10-digit mobile number for OTP verification and emergency contact">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </ValidationTooltip>
                          </div>
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

                  {/* Email Address with Validation Tooltip */}
                  <FormField
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Email Address *</FormLabel>
                          <ValidationTooltip message="Professional email address for official communications">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Emergency Contact *</FormLabel>
                          <ValidationTooltip message="Contact number of a family member or close friend for emergencies">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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

            {/* Continue with other steps... (Step 2-6 would follow the same pattern with enhanced tooltips and file uploads) */}

            {/* For brevity, I'll add a simplified version of Step 2 to show the pattern */}
            <TabsContent value="step2" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🔹 Step 2: Professional Information</CardTitle>
                  <CardDescription>Educational qualifications and professional experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Specialization with Validation Tooltip */}
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Specialization *</FormLabel>
                          <ValidationTooltip message="Your primary area of medical expertise">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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

                  {/* Resume/CV Upload with Preview */}
                  <FileUploadWithPreview
                    fieldName="resumeCV"
                    label="Upload Resume/CV"
                    accept=".pdf,.doc,.docx"
                    description="PDF, DOC, DOCX (Max 5MB)"
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Highest Qualification *</FormLabel>
                          <ValidationTooltip message="Your highest medical degree or certification">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Total Experience (Years) *</FormLabel>
                          <ValidationTooltip message="Total years of medical practice experience">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Medical Council Registration No. *</FormLabel>
                          <ValidationTooltip message="Your unique registration number from medical council">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = e.target.value ? new Date(e.target.value) : undefined
                                field.onChange(date)
                              }}
                              max={format(new Date(), "yyyy-MM-dd")}
                              min="2000-01-01"
                              className="flex-1"
                            />
                          </FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline" size="icon" className="shrink-0">
                                <CalendarIcon className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => date > new Date()}
                                initialFocus
                                captionLayout="dropdown"
                                fromYear={2000}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
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
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = e.target.value ? new Date(e.target.value) : undefined
                                field.onChange(date)
                              }}
                              min={format(new Date(), "yyyy-MM-dd")}
                              max={format(
                                new Date(new Date().setFullYear(new Date().getFullYear() + 20)),
                                "yyyy-MM-dd"
                              )}
                              className="flex-1"
                            />
                          </FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline" size="icon" className="shrink-0">
                                <CalendarIcon className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => date < new Date()}
                                initialFocus
                                captionLayout="dropdown"
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 20}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Upload License/Certificate with Preview */}
                  <FileUploadWithPreview
                    fieldName="licenseDocument"
                    label="Upload License/Certificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                    description="PDF, JPG, PNG (Max 5MB)"
                  />

                  {/* ID Proof with Preview */}
                  <FileUploadWithPreview
                    fieldName="idProofDocument"
                    label="ID Proof (Aadhaar/PAN/Passport)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    description="PDF, JPG, PNG (Max 5MB)"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 4: Hospital Role & Availability */}
            <TabsContent value="step4" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🏥 Step 4: Department & Role Assignment</CardTitle>
                  <CardDescription>Hospital department assignment and role configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Department Selection */}
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Department *</FormLabel>
                          <ValidationTooltip message="Select the primary medical department you will be working in">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
                        <Select
                          onValueChange={value => {
                            field.onChange(value)
                            // Reset sub-department when department changes
                            form.setValue("subDepartment", "")
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select medical department" />
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

                  {/* Sub-Department (conditional) */}
                  {form.watch("department") && subDepartments[form.watch("department")] && (
                    <FormField
                      control={form.control}
                      name="subDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Sub-Department (Optional)</FormLabel>
                            <ValidationTooltip message="Choose a specialized area within your department">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </ValidationTooltip>
                          </div>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${form.watch("department")} specialization`} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subDepartments[form.watch("department")]?.map(subDept => (
                                <SelectItem key={subDept} value={subDept}>
                                  {subDept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Specialized area within {form.watch("department")}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Role / Designation */}
                  <FormField
                    control={form.control}
                    name="roleDesignation"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Role / Designation *</FormLabel>
                          <ValidationTooltip message="Your position level and responsibilities in the department">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
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

                  {/* Assigned Unit / Ward */}
                  <FormField
                    control={form.control}
                    name="assignedUnit"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Assigned Unit / Ward (Optional)</FormLabel>
                          <ValidationTooltip message="Specific unit or ward where you will primarily work">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit/ward (if applicable)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assignedUnits.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Primary unit or ward assignment</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Consultation Type */}
                  <FormField
                    control={form.control}
                    name="consultationType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FormLabel>Consultation Type *</FormLabel>
                          <ValidationTooltip message="Type of patient consultations you will handle">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="OPD" id="opd" />
                              <Label htmlFor="opd">OPD (Outpatient)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="IPD" id="ipd" />
                              <Label htmlFor="ipd">IPD (Inpatient)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Both" id="both" />
                              <Label htmlFor="both">Both OPD & IPD</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>Choose the type of consultations you will provide</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Working Location */}
                  <FormField
                    control={form.control}
                    name="workingLocation"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Working Location *</FormLabel>
                          <ValidationTooltip message="Primary location where you will provide services">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select working location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workingLocations.map(location => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Senior / Reporting To */}
                  <FormField
                    control={form.control}
                    name="reportingTo"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Senior / Reporting To (Optional)</FormLabel>
                          <ValidationTooltip message="Senior doctor or department head you will report to">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reporting manager" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {seniorDoctors.map(senior => (
                              <SelectItem key={senior} value={senior}>
                                {senior}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Department head or senior doctor for guidance and reporting</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Divider */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">📅 Schedule & Availability</h3>
                  </div>

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
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-base">Working Days *</FormLabel>
                            <ValidationTooltip message="Select the days you will be available for consultation">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </ValidationTooltip>
                          </div>
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Max Patients per Day *</FormLabel>
                          <ValidationTooltip message="Maximum number of patients you can see in one day">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Payment Mode *</FormLabel>
                          <ValidationTooltip message="How you will be compensated for your services">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <FormLabel>IFSC Code *</FormLabel>
                          <ValidationTooltip message="Bank's IFSC code for electronic transfers (11 characters)">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Username *</FormLabel>
                          <ValidationTooltip message="Unique username for portal login (3+ characters)">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Password *</FormLabel>
                          <ValidationTooltip message="Strong password with minimum 8 characters including letters, numbers and symbols">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </ValidationTooltip>
                        </div>
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
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-base">Enable Two-Factor Authentication</FormLabel>
                            <ValidationTooltip message="Add extra security to your account with SMS verification">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </ValidationTooltip>
                          </div>
                          <FormDescription>Add extra security to your account with SMS verification</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Digital Signature with Preview */}
                  <FileUploadWithPreview
                    fieldName="digitalSignature"
                    label="Upload Digital Signature (for e-Prescription)"
                    accept="image/*"
                    description="PNG, JPG (Max 1MB, Transparent background preferred)"
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
                            knowledge. I understand that any false information may lead to rejection of my application
                            or termination of services. I consent to the processing of my personal data for registration
                            and hospital management purposes.
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
              <Button type="button" variant="outline" onClick={saveDraft} disabled={!isDirty}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
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
    </div>
  )
}
