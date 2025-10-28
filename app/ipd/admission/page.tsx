"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, User, Search, Calendar, MapPin, DollarSign, Users, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PatientSearch, AdmissionForm, NewPatientForm, ComprehensiveAdmissionForm } from "@/components/ipd"
import { EnhancedAdmissionForm } from "@/components/ipd/enhanced-admission-form"
import { Patient } from "@/lib/ipd-types"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"

type ViewMode = "search" | "new-admission"

export default function AdmissionPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("search")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const searchParams = useSearchParams()

  // Check for pre-selected patient from URL parameters
  useEffect(() => {
    const patientId = searchParams.get("patientId")
    const name = searchParams.get("name")

    if (patientId && name) {
      // Create a temporary patient object for pre-selection
      const preSelectedPatient: Patient = {
        id: patientId,
        uhid: `PAT${patientId.slice(-3).padStart(3, "0")}`, // Generate a temporary UHID
        name: decodeURIComponent(name),
        age: 0, // This would be calculated from actual patient data
        gender: "male" as const,
        phone: "",
        email: "",
        address: "",
        emergencyContact: { name: "", relation: "", phone: "" },
        bloodGroup: "O+" as const,
        allergies: [],
        medicalHistory: "Pre-selected from OPD",
      }

      setSelectedPatient(preSelectedPatient)
    }
  }, [searchParams])

  const handleNewAdmission = () => {
    setViewMode("new-admission")
  }

  const handleAdmissionSuccess = (admissionData: any) => {
    console.log("Admission completed:", admissionData)
    setViewMode("search")
    setSelectedPatient(null)
  }

  const handleAdmissionCancel = () => {
    setViewMode("search")
    setSelectedPatient(null)
  }

  const handleBackToSearch = () => {
    setViewMode("search")
    setSelectedPatient(null)
  }

  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Patient Admission</h1>
              <p className="text-muted-foreground">Admit patients to inpatient department and assign beds</p>
            </div>
            <div className="flex items-center space-x-2">
              {viewMode === "new-admission" ? (
                <Button variant="outline" onClick={handleBackToSearch}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Search
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => router.push("/admin/ipd")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search Records
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleNewAdmission}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Patient Admission
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards - Only show in search view */}
          {viewMode === "search" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Admissions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Admissions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Scheduled today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Deposit</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,450</div>
                  <p className="text-xs text-muted-foreground">Per admission</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content - Search or New Admission Form */}
          {viewMode === "search" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Admission
                </CardTitle>
                <CardDescription>Search for existing patients to admit to the inpatient department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <PatientSearch onPatientSelect={setSelectedPatient} selectedPatient={selectedPatient} />
                  {selectedPatient && <AdmissionForm patient={selectedPatient} isNewPatient={false} />}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600/10 rounded-lg">
                      <Plus className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Complete Patient Admission</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Full admission process including patient registration, admission details, and payment information
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    New Admission
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <EnhancedAdmissionForm
                  onSubmit={handleAdmissionSuccess}
                  onCancel={handleAdmissionCancel}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
