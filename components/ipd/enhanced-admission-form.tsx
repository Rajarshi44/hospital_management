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
import { 
  getDepartments, 
  getDoctorsByDepartment,
  getWardsByType,
  getAvailableRoomsByWard,
  getAvailableBedsByRoom,
  uploadDocuments,
  createEnhancedAdmission,
  transformEnhancedFormToDTO,
  mockDepartments,
  mockDoctors,
  mockWards,
  mockBeds
} from "@/lib/admission-service"
import { IPDService } from "@/lib/ipd-service"

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
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Backend data states
  const [departments, setDepartments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [availableRooms, setAvailableRooms] = useState<string[]>([])
  const [availableBeds, setAvailableBeds] = useState<any[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])

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

  // Load initial data from backend
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true)
      try {
        // Load departments first
        const departmentsData = await getDepartments().catch(() => mockDepartments) as any[]
        setDepartments(departmentsData)
        
        // Set initial doctors (use mock data as fallback)
        setDoctors(mockDoctors)
        setFilteredDoctors(mockDoctors)
        
        // Load wards (we'll filter these based on ward type selection)
        setWards(mockWards) // Use mock data for now, will be loaded when ward type changes
        
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast({
          title: "Error Loading Data",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadInitialData()
  }, [toast])

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

  // Handle department change to filter doctors
  const handleDepartmentChange = (departmentId: string) => {
    form.setValue("department", departmentId)
    form.setValue("admittingDoctor", "") // Reset doctor selection
    
    // Filter doctors by department
    getDoctorsByDepartment(departmentId).then((filteredDocs) => {
      setFilteredDoctors(filteredDocs as any[])
    }).catch((error: any) => {
      console.error('Error filtering doctors:', error)
      // Fallback to mock data
      const fallbackDoctors = mockDoctors.filter(doc => doc.departmentId === departmentId)
      setFilteredDoctors(fallbackDoctors)
    })
  }

  // Load wards and beds based on ward type
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "wardType" && value.wardType) {
        console.log('Ward type changed to:', value.wardType)
        
        // Load wards based on ward type
        getWardsByType(value.wardType).then(async (wardsData: any) => {
          console.log('Loaded wards for type:', wardsData)
          setWards(wardsData || [])
          
          if (!wardsData || wardsData.length === 0) {
            console.log('No wards found for type:', value.wardType)
            setAvailableBeds([])
            setAvailableRooms([])
            toast({
              title: "No Wards Available",
              description: `No ${value.wardType} wards are currently available.`,
              variant: "destructive"
            })
            return
          }
          
          // Load all available beds from all wards of this type
          if (wardsData && wardsData.length > 0) {
            let allBeds: any[] = []
            let allRooms: string[] = []
            
            // Get beds from all wards of this type
            for (const ward of wardsData) {
              try {
                const wardBeds = await IPDService.getBedsByWard(ward.id, { isOccupied: false })
                console.log(`Beds from ward ${ward.name}:`, wardBeds)
                
                // Add ward information to each bed
                const bedsWithWard = (wardBeds as any[]).map(bed => ({
                  ...bed,
                  wardName: ward.name,
                  wardNumber: ward.wardNumber
                }))
                
                allBeds = [...allBeds, ...bedsWithWard]
              } catch (error) {
                console.error(`Error loading beds for ward ${ward.id}:`, error)
              }
            }
            
            // Generate room numbers based on total beds (every 4 beds = 1 room)
            const totalBeds = allBeds.length
            const roomCount = Math.ceil(totalBeds / 4)
            allRooms = []
            for (let i = 1; i <= roomCount; i++) {
              allRooms.push(`Room ${i}`)
            }
            
            console.log('All available beds:', allBeds)
            console.log('Generated rooms:', allRooms)
            console.log(`Ward Type "${value.wardType}": ${allBeds.length} beds across ${wardsData.length} wards, ${allRooms.length} rooms`)
            setAvailableBeds(allBeds)
            setAvailableRooms(allRooms)
          } else {
            setAvailableBeds([])
            setAvailableRooms([])
          }
          
          // Reset selections when ward type changes
          form.setValue("roomNo", "")
          form.setValue("bedNo", "")
        }).catch((error: any) => {
          console.error('Error loading wards:', error)
          // Fallback to mock data
          const fallbackWards = mockWards.filter(ward => ward.type === value.wardType?.toUpperCase())
          setWards(fallbackWards)
          setAvailableRooms(['Room 1', 'Room 2', 'Room 3'])
          setAvailableBeds([])
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Handle ward selection to load rooms
  const handleWardSelection = async (wardId: string) => {
    try {
      const rooms = await getAvailableRoomsByWard(wardId)
      setAvailableRooms(rooms)
      
      // Reset room and bed selection
      form.setValue("roomNo", "")
      form.setValue("bedNo", "")
      setAvailableBeds([])
    } catch (error) {
      console.error('Error loading rooms for ward:', error)
    }
  }

  // Handle room selection to filter beds
  const handleRoomSelection = (roomNumber: string) => {
    console.log('Room selected:', roomNumber)
    
    // Get room number (e.g., "Room 1" -> 1)
    const roomNum = parseInt(roomNumber.split(' ')[1] || '1')
    
    // Filter beds for this room (every 4 beds = 1 room, starting from 0)
    const roomStartIndex = (roomNum - 1) * 4
    const roomEndIndex = roomStartIndex + 4
    
    // Use the current ward type to get all beds again
    const wardType = form.getValues("wardType")
    
    // Get all beds from available wards and filter by room
    let allBedsForType: any[] = []
    
    // Recreate the full bed list from current wards
    const loadRoomBeds = async () => {
      try {
        for (const ward of wards) {
          const wardBeds = await IPDService.getBedsByWard(ward.id, { isOccupied: false }) as any[]
          const bedsWithWard = wardBeds.map(bed => ({
            ...bed,
            wardName: ward.name,
            wardNumber: ward.wardNumber
          }))
          allBedsForType = [...allBedsForType, ...bedsWithWard]
        }
        
        // Filter beds for selected room
        const roomBeds = allBedsForType.slice(roomStartIndex, roomEndIndex)
        console.log(`Room ${roomNum}: showing beds ${roomStartIndex + 1}-${roomEndIndex} of ${allBedsForType.length} total`)
        console.log('Beds for selected room:', roomBeds.map(b => `${b.wardName}-${b.bedNumber}`))
        
        setAvailableBeds(roomBeds)
        
        // Reset bed selection
        form.setValue("bedNo", "")
      } catch (error) {
        console.error('Error filtering beds by room:', error)
      }
    }
    
    loadRoomBeds()
  }

  const handleFormSubmit = async (data: EnhancedAdmissionFormData) => {
    setIsSubmitting(true)
    try {
      // Transform form data to backend DTO format
      const admissionDTO = transformEnhancedFormToDTO(data)

      console.log("Enhanced Admission DTO:", admissionDTO)

      // Call real backend API
      const response = await createEnhancedAdmission(admissionDTO) as any

      toast({
        title: "Success!",
        description: `Patient ${data.fullName} has been admitted successfully. Admission ID: ${response.admissionId || response.id}`,
      })
      
      onSubmit(response)
    } catch (error) {
      console.error("Enhanced admission failed:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete admission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle document uploads
  const handleDocumentUpload = async (files: FileList) => {
    try {
      // Validate files
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      
      const validFiles = Array.from(files).filter(file => {
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 5MB. Please choose a smaller file.`,
            variant: "destructive",
          })
          return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a supported file type. Please use PDF, JPG, or PNG.`,
            variant: "destructive",
          })
          return false;
        }
        
        return true;
      });

      if (validFiles.length === 0) {
        return;
      }

      // Create a new FileList with valid files
      const dt = new DataTransfer();
      validFiles.forEach(file => dt.items.add(file));
      const validFileList = dt.files;

      console.log('Uploading documents:', validFiles.map(f => f.name));
      
      const uploadedFiles = await uploadDocuments(validFileList) as any[];
      
      // Extract file names from the response
      const fileNames = uploadedFiles.map((file: any) => 
        file.documentName || file.originalName || file.fileName || 'Unknown file'
      );
      
      setUploadedDocuments(prev => [...prev, ...fileNames])
      
      toast({
        title: "Documents Uploaded",
        description: `${validFiles.length} document(s) uploaded successfully.`,
      })
    } catch (error) {
      console.error("Document upload failed:", error)
      toast({
        title: "Upload Failed", 
        description: error instanceof Error ? error.message : "Failed to upload documents. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleDocumentUpload(files)
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
                        <Select value={field.value} onValueChange={handleDepartmentChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept: any) => (
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
                            {filteredDoctors.map((doctor: any) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
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
                            {filteredDoctors.map((doctor: any) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
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
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleRoomSelection(value)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRooms.map((room) => (
                              <SelectItem key={room} value={room}>
                                {room}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Generated rooms (4 beds per room)</FormDescription>
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
                            {availableBeds.map((bed) => (
                              <SelectItem key={bed.id} value={bed.id}>
                                {bed.wardName && `${bed.wardName} - `}{bed.bedNumber || `Bed-${bed.id?.substring(0,8)}`} - {bed.bedType || 'Standard'} - ₹{bed.dailyRate || 1500}/day
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Select from available beds ({availableBeds.length} available)</FormDescription>
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
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('id-proof-upload')?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        id="id-proof-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
                      />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Referral Document</Label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('referral-upload')?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        id="referral-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
                      />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Insurance Documents</Label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('insurance-upload')?.click()}
                    >
                      <input
                        id="insurance-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
                      />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload multiple files</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB each)</p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Documents ({uploadedDocuments.length})</Label>
                    <div className="space-y-2">
                      {uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Uploaded
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
