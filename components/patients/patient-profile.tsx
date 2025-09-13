"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Edit, Phone, Mail, User, Heart, Pill, FileText, Activity, AlertTriangle, Plus } from "lucide-react"
import type { Patient } from "@/lib/patients"
import { format, differenceInYears } from "date-fns"
import { getPatientVitals } from "@/lib/patients"

interface PatientProfileProps {
  patient: Patient
  onEdit: () => void
  onClose: () => void
}

export function PatientProfile({ patient, onEdit, onClose }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const vitals = getPatientVitals(patient.id)

  const calculateAge = (dateOfBirth: Date) => {
    return differenceInYears(new Date(), dateOfBirth)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "deceased":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMedicationStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "discontinued":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
                  {patient.firstName[0]}
                  {patient.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Age {calculateAge(patient.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>Blood Type: {patient.bloodType}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span>Patient ID: {patient.id}</span>
                  <span className="ml-4">Registered: {format(patient.registrationDate, "MMM d, yyyy")}</span>
                  {patient.lastVisit && (
                    <span className="ml-4">Last visit: {format(patient.lastVisit, "MMM d, yyyy")}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
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
                    <p>{format(patient.dateOfBirth, "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="capitalize">{patient.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Height</label>
                    <p>{patient.height}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Weight</label>
                    <p>{patient.weight}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p>
                    {patient.address.street}
                    <br />
                    {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                  </p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                  <p>
                    {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                    <br />
                    {patient.emergencyContact.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Allergies & Assigned Doctor */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No known allergies</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assigned Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.assignedDoctor ? (
                    <p className="font-medium">{patient.assignedDoctor}</p>
                  ) : (
                    <p className="text-muted-foreground">No assigned doctor</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Medical History</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>

          {patient.medicalHistory.length > 0 ? (
            <div className="space-y-4">
              {patient.medicalHistory
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{record.type}</Badge>
                            <h4 className="font-medium">{record.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{record.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <span>{format(record.date, "MMM d, yyyy")}</span>
                            <span className="ml-4">by {record.doctorName}</span>
                          </div>
                        </div>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No medical history records</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Current Medications</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>

          {patient.medications.length > 0 ? (
            <div className="space-y-4">
              {patient.medications.map((medication) => (
                <Card key={medication.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{medication.name}</h4>
                          <Badge className={getMedicationStatusColor(medication.status)}>{medication.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            <strong>Dosage:</strong> {medication.dosage}
                          </p>
                          <p>
                            <strong>Frequency:</strong> {medication.frequency}
                          </p>
                          <p>
                            <strong>Prescribed by:</strong> {medication.prescribedBy}
                          </p>
                          <p>
                            <strong>Start Date:</strong> {format(medication.startDate, "MMM d, yyyy")}
                          </p>
                          {medication.endDate && (
                            <p>
                              <strong>End Date:</strong> {format(medication.endDate, "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Pill className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No current medications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Vital Signs</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Record Vitals
            </Button>
          </div>

          {vitals.length > 0 ? (
            <div className="space-y-4">
              {vitals
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((vital) => (
                  <Card key={vital.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium">{format(vital.date, "MMM d, yyyy 'at' h:mm a")}</h4>
                        <Badge variant="outline">Recorded by {vital.recordedBy}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-muted-foreground">Blood Pressure</label>
                          <p>
                            {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic} mmHg
                          </p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Heart Rate</label>
                          <p>{vital.heartRate} bpm</p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Temperature</label>
                          <p>{vital.temperature}°F</p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">O2 Saturation</label>
                          <p>{vital.oxygenSaturation}%</p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Respiratory Rate</label>
                          <p>{vital.respiratoryRate} /min</p>
                        </div>
                        {vital.weight && (
                          <div>
                            <label className="font-medium text-muted-foreground">Weight</label>
                            <p>{vital.weight} lbs</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No vital signs recorded</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Insurance Provider</label>
                  <p className="font-medium">{patient.insurance.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Policy Number</label>
                  <p className="font-mono">{patient.insurance.policyNumber}</p>
                </div>
                {patient.insurance.groupNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Group Number</label>
                    <p className="font-mono">{patient.insurance.groupNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
