"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  Bed, 
  Stethoscope, 
  Calendar, 
  Phone, 
  MapPin,
  Clock,
  Search,
  Eye,
  Edit,
  Activity
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
    gender: string
    dateOfBirth: string
    bloodGroup?: string
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
  createdAt: string
}

interface AdmittedPatientsListProps {
  onPatientSelect?: (patient: AdmittedPatient) => void
}

export function AdmittedPatientsList({ onPatientSelect }: AdmittedPatientsListProps) {
  const [patients, setPatients] = useState<AdmittedPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchAdmittedPatients()
  }, [])

  const fetchAdmittedPatients = async () => {
    try {
      setLoading(true)
      const response = await IPDService.getAdmissions({
        status: 'ACTIVE',
        limit: 50
      }) as any
      console.log('Admissions response:', response)
      setPatients(response.data || response || [])
    } catch (error) {
      console.error('Error fetching admitted patients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch admitted patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      `${patient.patient.firstName} ${patient.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.admissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient.phone.includes(searchTerm)
    
    const matchesStatus = selectedStatus === "all" || patient.status.toLowerCase() === selectedStatus.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admitted Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admitted Patients ({filteredPatients.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchAdmittedPatients}>
            Refresh
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, admission number, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="critical">Critical</option>
            <option value="stable">Stable</option>
            <option value="observation">Observation</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || selectedStatus !== "all" ? "No patients found matching your criteria" : "No admitted patients found"}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onPatientSelect?.(patient)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {patient.patient.firstName[0]}{patient.patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {patient.patient.firstName} {patient.patient.lastName}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          #{patient.admissionId}
                        </Badge>
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        <Badge className={getAdmissionTypeColor(patient.admissionType)}>
                          {patient.admissionType}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Age {calculateAge(patient.patient.dateOfBirth)} • {patient.patient.gender}</span>
                          {patient.patient.bloodGroup && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                              {patient.patient.bloodGroup}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{patient.patient.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Admitted {format(new Date(patient.admissionDate), 'dd MMM yyyy')}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4" />
                          <span>{patient.bed.ward.name} - Bed {patient.bed.bedNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          <span>Dr. {patient.doctor.firstName} {patient.doctor.lastName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{patient.doctor.primaryDepartment?.name || 'No Department'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">Chief Complaint:</span> {patient.chiefComplaint}
                        </p>
                        {patient.provisionalDiagnosis && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Provisional Diagnosis:</span> {patient.provisionalDiagnosis}
                          </p>
                        )}
                      </div>
                      
                      {patient.depositAmount && (
                        <div className="mt-2 text-sm text-green-600">
                          <span className="font-medium">Deposit:</span> ₹{patient.depositAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}