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
  Stethoscope,
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
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visit">Visit</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
          <TabsTrigger value="investigations">Tests</TabsTrigger>
          <TabsTrigger value="followup">Follow-up</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
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

        <TabsContent value="visit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Visit Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visit ID</label>
                  <p className="font-medium">VID-{Date.now().toString().slice(-6)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visit Date</label>
                  <p className="font-medium">{format(new Date(), "PPP")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="font-medium">General Medicine</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Consulting Doctor</label>
                  <p className="font-medium">Dr. Sarah Johnson</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Specialization</label>
                  <p className="font-medium">General Physician</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visit Type</label>
                  <Badge>OPD</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Appointment Mode</label>
                  <Badge variant="outline">Walk-in</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Token Number</label>
                  <p className="font-medium">T-042</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visit Priority</label>
                  <Badge variant="secondary">Normal</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visit Status</label>
                  <Badge className="bg-green-600">Completed</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Referral Source</label>
                  <p className="font-medium">Self</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vitals Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vital Signs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-muted-foreground text-xs">Height</div>
                    <div className="font-semibold">170 cm</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-muted-foreground text-xs">Weight</div>
                    <div className="font-semibold">68 kg</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-muted-foreground text-xs">BMI</div>
                    <div className="font-semibold">23.5</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-muted-foreground text-xs">Temperature</div>
                    <div className="font-semibold">98.6°F</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-muted-foreground text-xs">Blood Pressure</div>
                    <div className="font-semibold">120/80</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-muted-foreground text-xs">Pulse Rate</div>
                    <div className="font-semibold">72 bpm</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-muted-foreground text-xs">Respiratory Rate</div>
                    <div className="font-semibold">16 /min</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-muted-foreground text-xs">SpO2</div>
                    <div className="font-semibold">98%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vitals Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-muted-foreground text-sm">Last Recorded:</span>
                  <div className="text-sm">{format(new Date(), "PPP p")}</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground text-sm">Recorded By:</span>
                  <div className="text-sm">Nurse Station - OPD</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground text-sm">Additional Notes:</span>
                  <div className="text-sm text-muted-foreground">
                    Patient vitals within normal range. No immediate concerns noted.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Chief Complaint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chief Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Fever and body ache for 3 days</p>
                <p className="text-xs text-muted-foreground mt-2">Duration: 3 days</p>
              </CardContent>
            </Card>

            {/* History of Present Illness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">History of Present Illness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Patient presents with high-grade fever (102°F) associated with generalized body ache and weakness.
                  Symptoms started 3 days ago. No cough, cold, or respiratory symptoms. Patient has been taking
                  over-the-counter paracetamol with temporary relief.
                </p>
              </CardContent>
            </Card>

            {/* Examination */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">General & Systemic Examination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-sm">General Examination:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Patient is conscious, oriented. Mild pallor present. No cyanosis, jaundice, or edema.
                  </p>
                </div>
                <div>
                  <span className="font-medium text-sm">Systemic Examination:</span>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                    <li>CVS: S1 S2 normal, no murmurs</li>
                    <li>RS: Bilateral air entry equal, no added sounds</li>
                    <li>CNS: Conscious, oriented, no focal deficit</li>
                    <li>Per Abdomen: Soft, non-tender</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Provisional Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Provisional Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">
                    Viral Fever
                  </Badge>
                  <Badge variant="outline">Under Investigation</Badge>
                  <p className="text-sm text-muted-foreground mt-3">Differential: Rule out dengue, malaria, typhoid</p>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Treatment Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 list-disc list-inside">
                  <li>Tab. Paracetamol 500mg TDS for fever</li>
                  <li>Tab. Multivitamin OD</li>
                  <li>Adequate hydration and rest</li>
                  <li>Follow-up after 3 days if fever persists</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Provisional Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Provisional Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-sm mb-2 block">Diagnosis:</span>
                  <div className="space-x-2">
                    <Badge variant="outline">Viral Fever</Badge>
                    <Badge variant="outline">Under Investigation</Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-sm mb-2 block">Differential Diagnosis:</span>
                  <p className="text-sm text-muted-foreground">Rule out dengue fever, malaria, typhoid fever</p>
                </div>
              </CardContent>
            </Card>

            {/* Final Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Final Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-sm mb-2 block">Confirmed Diagnosis:</span>
                  <Badge className="bg-blue-600">Acute Viral Fever</Badge>
                </div>
                <div>
                  <span className="font-medium text-sm mb-2 block">ICD-10 Codes:</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">A90 - Dengue Fever</Badge>
                    <Badge variant="secondary">R50.9 - Fever, unspecified</Badge>
                    <Badge variant="secondary">M79.3 - Myalgia</Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-sm mb-2 block">Clinical Notes:</span>
                  <p className="text-sm text-muted-foreground">
                    Patient diagnosed with acute viral fever based on clinical presentation and investigation reports.
                    Dengue NS1 antigen positive. Blood parameters show mild thrombocytopenia (Platelet count:
                    145,000/μL). Patient advised close monitoring and adequate hydration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions & Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Prescriptions Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Drug Name</th>
                        <th className="text-left p-3 font-medium">Strength</th>
                        <th className="text-left p-3 font-medium">Route</th>
                        <th className="text-left p-3 font-medium">Frequency</th>
                        <th className="text-left p-3 font-medium">Dose</th>
                        <th className="text-left p-3 font-medium">Duration</th>
                        <th className="text-left p-3 font-medium">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-3 font-medium">Paracetamol</td>
                        <td className="p-3">500mg</td>
                        <td className="p-3">Oral</td>
                        <td className="p-3">TDS</td>
                        <td className="p-3">1 Tab</td>
                        <td className="p-3">5 Days</td>
                        <td className="p-3 text-muted-foreground">After food, for fever</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">Ondansetron</td>
                        <td className="p-3">4mg</td>
                        <td className="p-3">Oral</td>
                        <td className="p-3">BD</td>
                        <td className="p-3">1 Tab</td>
                        <td className="p-3">3 Days</td>
                        <td className="p-3 text-muted-foreground">Before food, for nausea</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">Multivitamin</td>
                        <td className="p-3">-</td>
                        <td className="p-3">Oral</td>
                        <td className="p-3">OD</td>
                        <td className="p-3">1 Tab</td>
                        <td className="p-3">7 Days</td>
                        <td className="p-3 text-muted-foreground">After breakfast</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Procedures */}
                <div className="space-y-2">
                  <span className="font-medium text-sm">Procedures Performed:</span>
                  <p className="text-sm text-muted-foreground">No procedures performed during this visit.</p>
                </div>

                {/* Treatment Notes */}
                <div className="space-y-2">
                  <span className="font-medium text-sm">Treatment Notes:</span>
                  <p className="text-sm text-muted-foreground">
                    Patient advised to maintain adequate hydration (3-4 liters/day). Avoid strenuous physical activity.
                    Monitor temperature twice daily. Watch for warning signs: severe abdominal pain, persistent
                    vomiting, bleeding manifestations. Return to hospital immediately if any warning signs develop.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investigations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lab Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Laboratory Investigations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Complete Blood Count (CBC)</p>
                      <p className="text-xs text-muted-foreground">Ordered on {format(new Date(), "PP")}</p>
                    </div>
                    <Badge className="bg-orange-600">Urgent</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Dengue NS1 Antigen</p>
                      <p className="text-xs text-muted-foreground">Ordered on {format(new Date(), "PP")}</p>
                    </div>
                    <Badge className="bg-orange-600">Urgent</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Platelet Count</p>
                      <p className="text-xs text-muted-foreground">Ordered on {format(new Date(), "PP")}</p>
                    </div>
                    <Badge className="bg-orange-600">Urgent</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Liver Function Test (LFT)</p>
                      <p className="text-xs text-muted-foreground">Ordered on {format(new Date(), "PP")}</p>
                    </div>
                    <Badge variant="secondary">Routine</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Malaria Parasite Test</p>
                      <p className="text-xs text-muted-foreground">Ordered on {format(new Date(), "PP")}</p>
                    </div>
                    <Badge variant="secondary">Routine</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radiology */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Radiology Investigations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Chest X-Ray (PA View)</p>
                      <p className="text-xs text-muted-foreground">Ordered on {format(new Date(), "PP")}</p>
                    </div>
                    <Badge variant="secondary">Routine</Badge>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Clinical Indication:</p>
                    <p>To rule out any pulmonary pathology in context of fever</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investigation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Investigation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-600">5 Urgent Tests</Badge>
                  <Badge variant="secondary">3 Routine Tests</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  All investigations ordered as per clinical assessment. Urgent tests should be completed within 4
                  hours. Reports to be reviewed immediately upon availability. Patient advised to return for follow-up
                  with reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followup" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Follow-up Details */}
            <Card>
              <CardHeader>
                <CardTitle>Follow-up Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Follow-up Date</label>
                  <p className="font-medium text-lg mt-1">
                    {format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), "PPP")}
                  </p>
                  <p className="text-sm text-muted-foreground">3 days from now</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Follow-up With</label>
                  <p className="font-medium">Dr. Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">General Medicine Department</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Appointment Status</label>
                  <Badge className="bg-blue-600">Scheduled</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Follow-up Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Follow-up Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <span className="font-medium">Important:</span> Return immediately if any warning signs develop
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <p className="font-medium text-sm">Instructions for next visit:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Bring all investigation reports</li>
                      <li>Maintain a fever chart (temperature records)</li>
                      <li>Note any new symptoms or complications</li>
                      <li>Bring current medications for review</li>
                      <li>Fasting not required</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="font-medium text-sm">Home Care Advice:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Complete bed rest for 5-7 days</li>
                      <li>Drink plenty of fluids (3-4 liters/day)</li>
                      <li>Avoid mosquito bites (use repellents, nets)</li>
                      <li>Take medications as prescribed</li>
                      <li>Monitor platelet count if dengue positive</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* IPD Referral */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">IPD Referral Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">No IPD Referral</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Patient is stable for outpatient management. Advised to follow up in OPD. If condition worsens or
                  warning signs develop, patient should report to emergency department for possible admission.
                </p>
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Warning Signs for IPD Admission:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Severe abdominal pain or persistent vomiting</li>
                    <li>Bleeding from any site (nose, gums, vomit, stool)</li>
                    <li>Platelet count below 50,000/μL</li>
                    <li>Signs of shock (cold extremities, rapid pulse, low BP)</li>
                    <li>Drowsiness or altered mental status</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Visit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">OPD Visit - General Medicine</div>
                    <div className="text-sm text-muted-foreground">{format(new Date(), "PPP")} • Dr. Sarah Johnson</div>
                    <div className="text-sm">Viral Fever - Treated and discharged</div>
                  </div>
                  <Badge>Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">OPD Visit - Cardiology</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "PPP")} • Dr. Michael Chen
                    </div>
                    <div className="text-sm">Routine checkup - All tests normal</div>
                  </div>
                  <Badge>Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
