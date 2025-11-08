"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, User, FileText, Pill, Download, Printer, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { IPDService } from "@/lib/ipd-service"
import { useToast } from "@/hooks/use-toast"
import { format, differenceInDays } from "date-fns"

interface Medication {
  id: string
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface DischargeDetails {
  id: string
  admission: {
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
      email?: string
      address?: string
    }
    doctor: {
      id: string
      firstName: string
      lastName: string
      specialization?: string
      primaryDepartment?: {
        id: string
        name: string
      }
    }
    bed: {
      id: string
      bedNumber: string
      ward: {
        id: string
        name: string
        type: string
      }
    }
    admissionDate: string
    status: string
  }
  dischargeDate: string
  dischargeTime?: string
  dischargeType?: string
  finalDiagnosis: string
  treatmentSummary?: string
  conditionAtDischarge?: string
  followUpInstructions?: string
  followUpDate?: string
  restrictions?: string
  notes?: string
  medications?: Medication[]
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialization?: string
  }
}

export default function DischargeDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [discharge, setDischarge] = useState<DischargeDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchDischargeDetails()
    }
  }, [params.id])

  const fetchDischargeDetails = async () => {
    try {
      setLoading(true)
      const response = await IPDService.getDischarge(params.id as string) as any
      setDischarge(response)
    } catch (error) {
      console.error('Error fetching discharge details:', error)
      toast({
        title: "Error",
        description: "Failed to load discharge details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Generation",
      description: "Discharge summary PDF will be downloaded shortly",
    })
    // TODO: Implement actual PDF generation
  }

  if (loading) {
    return (
      <AuthProvider>
        <AppLayout>
          <div className="container mx-auto p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading discharge details...</p>
            </div>
          </div>
        </AppLayout>
      </AuthProvider>
    )
  }

  if (!discharge) {
    return (
      <AuthProvider>
        <AppLayout>
          <div className="container mx-auto p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Discharge record not found</p>
              <Button onClick={() => router.push("/ipd/discharge")} className="mt-4">
                Back to Discharges
              </Button>
            </div>
          </div>
        </AppLayout>
      </AuthProvider>
    )
  }

  const patient = discharge.admission.patient
  const admittingDoctor = discharge.admission.doctor
  const dischargingDoctor = discharge.doctor
  const bed = discharge.admission.bed
  const admissionDate = new Date(discharge.admission.admissionDate)
  const dischargeDate = new Date(discharge.dischargeDate)
  const stayDuration = differenceInDays(dischargeDate, admissionDate)

  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6 print:p-0">
          {/* Header - Hidden when printing */}
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Discharge Summary</h1>
              <p className="text-muted-foreground">
                Discharge ID: {discharge.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => router.push("/ipd/discharge")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Print Header - Only visible when printing */}
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-2xl font-bold">Hospital Management System</h1>
            <h2 className="text-xl font-semibold mt-2">DISCHARGE SUMMARY</h2>
            <p className="text-sm mt-2">
              Discharge ID: {discharge.id.slice(-8).toUpperCase()} | 
              Date: {format(dischargeDate, 'dd MMM yyyy, HH:mm')}
            </p>
          </div>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">UHID</p>
                  <p className="font-medium">{patient.id.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{patient.gender?.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age / DOB</p>
                  <p className="font-medium">
                    {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years / 
                    {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}
                  </p>
                </div>
                {patient.bloodGroup && (
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p className="font-medium">{patient.bloodGroup}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                {patient.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                )}
                {patient.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Admission & Discharge Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Admission ID</p>
                  <p className="font-medium">{discharge.admission.admissionId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ward / Bed</p>
                  <p className="font-medium">{bed.ward.name} - Bed {bed.bedNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission Date</p>
                  <p className="font-medium">{format(admissionDate, 'dd MMM yyyy, HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discharge Date</p>
                  <p className="font-medium">
                    {format(dischargeDate, 'dd MMM yyyy')}
                    {discharge.dischargeTime && ` at ${discharge.dischargeTime}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Length of Stay</p>
                  <Badge variant="outline" className="font-medium">
                    {stayDuration} {stayDuration === 1 ? 'day' : 'days'}
                  </Badge>
                </div>
                {discharge.dischargeType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Discharge Type</p>
                    <Badge variant="secondary">{discharge.dischargeType}</Badge>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Admitting Doctor</p>
                  <p className="font-medium">
                    Dr. {admittingDoctor.firstName} {admittingDoctor.lastName}
                    {admittingDoctor.specialization && ` (${admittingDoctor.specialization})`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discharging Doctor</p>
                  <p className="font-medium">
                    Dr. {dischargingDoctor.firstName} {dischargingDoctor.lastName}
                    {dischargingDoctor.specialization && ` (${dischargingDoctor.specialization})`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Clinical Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Final Diagnosis</h4>
                <p className="text-sm">{discharge.finalDiagnosis}</p>
              </div>
              
              {discharge.treatmentSummary && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Treatment Summary</h4>
                    <p className="text-sm whitespace-pre-wrap">{discharge.treatmentSummary}</p>
                  </div>
                </>
              )}

              {discharge.conditionAtDischarge && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Condition at Discharge</h4>
                    <p className="text-sm">{discharge.conditionAtDischarge}</p>
                  </div>
                </>
              )}

              {discharge.followUpInstructions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Follow-up Instructions</h4>
                    <p className="text-sm whitespace-pre-wrap">{discharge.followUpInstructions}</p>
                    {discharge.followUpDate && (
                      <p className="text-sm mt-2 font-medium">
                        Follow-up Date: {format(new Date(discharge.followUpDate), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                </>
              )}

              {discharge.restrictions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Restrictions / Precautions</h4>
                    <p className="text-sm whitespace-pre-wrap">{discharge.restrictions}</p>
                  </div>
                </>
              )}

              {discharge.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Additional Notes</h4>
                    <p className="text-sm whitespace-pre-wrap">{discharge.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Discharge Medications */}
          {discharge.medications && discharge.medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Discharge Medications
                </CardTitle>
                <CardDescription>
                  Continue these medications as prescribed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine Name</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Instructions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discharge.medications.map((med, index) => (
                        <TableRow key={med.id || index}>
                          <TableCell className="font-medium">{med.medicineName}</TableCell>
                          <TableCell>{med.dosage}</TableCell>
                          <TableCell>{med.frequency}</TableCell>
                          <TableCell>{med.duration}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {med.instructions || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer - Print only */}
          <div className="hidden print:block mt-12 pt-6 border-t">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold">Discharging Doctor's Signature</p>
                <div className="mt-8 border-t border-gray-400 w-48"></div>
                <p className="text-xs mt-1">
                  Dr. {dischargingDoctor.firstName} {dischargingDoctor.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Date & Time</p>
                <p className="text-sm mt-2">{format(dischargeDate, 'dd MMM yyyy, HH:mm')}</p>
              </div>
            </div>
            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>This is a computer-generated discharge summary and does not require a physical signature</p>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
