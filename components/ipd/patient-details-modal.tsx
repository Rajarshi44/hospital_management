"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  Bed, 
  Stethoscope, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Clock,
  Activity,
  FileText,
  DollarSign,
  Heart,
  Thermometer,
  Droplets,
  X
} from "lucide-react"
import { IPDService } from "@/lib/ipd-service"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface AdmittedPatient {
  id: string
  admissionId: string
  patient: {
    id: string
    firstName: string
    lastName: string
    phone: string
    email?: string
    gender: string
    dateOfBirth: string
    bloodGroup?: string
    address?: string
    allergies?: string
    chronicConditions?: string
  }
  doctor: {
    id: string
    firstName: string
    lastName: string
    primaryDepartment?: {
      id: string
      name: string
    }
  }
  bed: {
    id: string
    bedNumber: string
    dailyRate: number
    ward: {
      id: string
      name: string
      type: string
    }
  }
  admissionDate: string
  admissionType: string
  status: string
  chiefComplaint: string
  provisionalDiagnosis: string
  depositAmount?: number
  notes?: string
  createdAt: string
}

interface PatientDetailsModalProps {
  patient: AdmittedPatient | null
  isOpen: boolean
  onClose: () => void
}

export function PatientDetailsModal({ patient, isOpen, onClose }: PatientDetailsModalProps) {
  const [vitals, setVitals] = useState<any[]>([])
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (patient && isOpen) {
      fetchPatientDetails()
    }
  }, [patient, isOpen])

  const fetchPatientDetails = async () => {
    if (!patient) return
    
    try {
      setLoading(true)
      // Fetch additional patient details like vitals, treatments, etc.
      // These would be separate API calls in a real implementation
      setVitals([])
      setTreatments([])
    } catch (error) {
      console.error('Error fetching patient details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'STABLE': return 'bg-blue-100 text-blue-800'
      case 'OBSERVATION': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAdmissionTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800'
      case 'ELECTIVE': return 'bg-blue-100 text-blue-800'
      case 'REFERRAL': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!patient) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                  {patient.patient.firstName[0]}{patient.patient.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {patient.patient.firstName} {patient.patient.lastName}
                </h2>
                <p className="text-muted-foreground">#{patient.admissionId}</p>
              </div>
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={getStatusColor(patient.status)}>
              {patient.status}
            </Badge>
            <Badge className={getAdmissionTypeColor(patient.admissionType)}>
              {patient.admissionType}
            </Badge>
            {patient.patient.bloodGroup && (
              <Badge variant="outline" className="text-red-600 border-red-200">
                {patient.patient.bloodGroup}
              </Badge>
            )}
          </div>

          {/* Patient Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Age:</span> {calculateAge(patient.patient.dateOfBirth)} years
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {patient.patient.gender}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {patient.patient.phone}
                </div>
                {patient.patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {patient.patient.email}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Bed Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Ward:</span> {patient.bed.ward.name}
                </div>
                <div>
                  <span className="font-medium">Bed:</span> {patient.bed.bedNumber}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {patient.bed.ward.type}
                </div>
                <div className="text-green-600 font-medium">
                  ₹{patient.bed.dailyRate}/day
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Admission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Date:</span> {format(new Date(patient.admissionDate), 'dd MMM yyyy')}
                </div>
                <div>
                  <span className="font-medium">Time:</span> {format(new Date(patient.createdAt), 'HH:mm')}
                </div>
                {patient.depositAmount && (
                  <div className="text-green-600 font-medium">
                    Deposit: ₹{patient.depositAmount.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="medical" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Consulting Doctor</h4>
                    <p>Dr. {patient.doctor.firstName} {patient.doctor.lastName}</p>
                    <p className="text-sm text-muted-foreground">{patient.doctor.primaryDepartment?.name || 'No Department'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Chief Complaint</h4>
                    <p className="text-sm">{patient.chiefComplaint}</p>
                  </div>
                  
                  {patient.provisionalDiagnosis && (
                    <div>
                      <h4 className="font-semibold mb-2">Provisional Diagnosis</h4>
                      <p className="text-sm">{patient.provisionalDiagnosis}</p>
                    </div>
                  )}
                  
                  {patient.patient.allergies && (
                    <div>
                      <h4 className="font-semibold mb-2">Allergies</h4>
                      <p className="text-sm">{patient.patient.allergies}</p>
                    </div>
                  )}
                  
                  {patient.patient.chronicConditions && (
                    <div>
                      <h4 className="font-semibold mb-2">Medical History</h4>
                      <p className="text-sm">{patient.patient.chronicConditions}</p>
                    </div>
                  )}
                  
                  {patient.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Additional Notes</h4>
                      <p className="text-sm">{patient.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vitals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No vital signs recorded yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {/* Vitals would be displayed here */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Treatment Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {treatments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No treatments prescribed yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {/* Treatments would be displayed here */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Billing Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Daily Bed Charges:</span>
                      <span>₹{patient.bed.dailyRate}</span>
                    </div>
                    {patient.depositAmount && (
                      <div className="flex justify-between text-green-600">
                        <span>Deposit Paid:</span>
                        <span>₹{patient.depositAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <p className="text-sm text-muted-foreground">
                        Detailed billing information will be available once treatments are prescribed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Record Vitals
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Add Treatment
            </Button>
            <Button variant="outline">
              <Bed className="h-4 w-4 mr-2" />
              Transfer Bed
            </Button>
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              View Billing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}