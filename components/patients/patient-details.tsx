"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Edit,
  AlertTriangle,
  FileText,
  Activity,
  Shield,
  Loader2,
} from "lucide-react"
import { PatientService, type Patient } from "@/lib/patient-service"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface PatientDetailsProps {
  patient: Patient
  onEdit?: () => void
  onClose: () => void
}

export function PatientDetails({ patient, onEdit, onClose }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [currentPatient, setCurrentPatient] = useState(patient)
  const patientService = PatientService.getInstance()
  const { toast } = useToast()

  const allergiesArray = patientService.getAllergiesArray(currentPatient)
  const medicationsArray = patientService.getMedicationsArray(currentPatient)

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true)
    try {
      const updatedPatient = currentPatient.isActive
        ? await patientService.deactivatePatient(currentPatient.id)
        : await patientService.activatePatient(currentPatient.id)

      setCurrentPatient(updatedPatient)
      toast({
        title: "Status updated",
        description: `Patient has been ${updatedPatient.isActive ? "activated" : "deactivated"}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const getGenderDisplay = (gender: string) => {
    const genderMap: Record<string, string> = {
      MALE: "Male",
      FEMALE: "Female",
      OTHER: "Other",
    }
    return genderMap[gender] || gender
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-lg">
                  {currentPatient.firstName[0]}
                  {currentPatient.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{patientService.getFullName(currentPatient)}</h2>
                  <Badge
                    className={
                      currentPatient.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }
                  >
                    {currentPatient.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Age {patientService.calculateAge(currentPatient.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{currentPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{currentPatient.email}</span>
                  </div>
                  {currentPatient.bloodGroup && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>Blood Type: {currentPatient.bloodGroup}</span>
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <span>Patient ID: {currentPatient.id}</span>
                  <span className="ml-4">Registered: {format(new Date(currentPatient.createdAt), "MMM d, yyyy")}</span>
                  <span className="ml-4">Updated: {format(new Date(currentPatient.updatedAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleToggleStatus} variant="outline" disabled={isTogglingStatus}>
                {isTogglingStatus ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {currentPatient.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button onClick={onClose} variant="ghost">
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p>{format(new Date(currentPatient.dateOfBirth), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p>{getGenderDisplay(currentPatient.gender)}</p>
                  </div>
                  {currentPatient.bloodGroup && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                      <p>{currentPatient.bloodGroup}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Address</label>
                  <p>
                    {currentPatient.address}
                    <br />
                    {currentPatient.city}, {currentPatient.state} {currentPatient.zipCode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allergiesArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allergiesArray.map((allergy, index) => (
                      <Badge key={index} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No known allergies</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicationsArray.length > 0 ? (
                  <ul className="space-y-2">
                    {medicationsArray.map((medication, index) => (
                      <li key={index} className="text-sm">
                        • {medication}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No current medications</p>
                )}
              </CardContent>
            </Card>

            {/* Chronic Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Chronic Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPatient.chronicConditions ? (
                  <p className="text-sm whitespace-pre-line">{currentPatient.chronicConditions}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No chronic conditions recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <p className="font-medium">{currentPatient.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <p className="font-medium">{currentPatient.email}</p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </label>
                <p className="font-medium">
                  {currentPatient.address}
                  <br />
                  {currentPatient.city}, {currentPatient.state} {currentPatient.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Contact this person in case of emergency</AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                  <p className="font-medium">{currentPatient.emergencyContactName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                  <p className="font-medium">{currentPatient.emergencyContactRelationship}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="font-medium">{currentPatient.emergencyContactPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
