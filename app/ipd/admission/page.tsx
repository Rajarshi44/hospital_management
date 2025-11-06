"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, User, Search, Calendar, MapPin, DollarSign, Users, ArrowLeft, Activity, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PatientSearch, AdmissionForm, NewPatientForm, ComprehensiveAdmissionForm, AdmittedPatientsList, PatientDetailsModal } from "@/components/ipd"
import { EnhancedAdmissionForm } from "@/components/ipd/enhanced-admission-form"
import { Patient } from "@/lib/ipd-types"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { IPDService } from "@/lib/ipd-service"
import { useToast } from "@/hooks/use-toast"

type ViewMode = "search" | "new-admission" | "admitted-patients"

export default function AdmissionPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("admitted-patients")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedAdmittedPatient, setSelectedAdmittedPatient] = useState<any>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await IPDService.getDashboardStats() as any
        setDashboardStats(response.summary || response)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        toast({
          title: "Warning",
          description: "Could not load real-time statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [toast])

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
    setViewMode("admitted-patients")
    setSelectedPatient(null)
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedAdmittedPatient(patient)
    setShowPatientModal(true)
  }

  const handleCloseModal = () => {
    setShowPatientModal(false)
    setSelectedAdmittedPatient(null)
  }

  const refreshStats = async () => {
    try {
      setLoading(true)
      const response = await IPDService.getDashboardStats() as any
      setDashboardStats(response.summary || response)
      toast({
        title: "Success",
        description: "Statistics refreshed successfully",
      })
    } catch (error) {
      console.error('Error refreshing stats:', error)
      toast({
        title: "Error",
        description: "Failed to refresh statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
                  Back to Patients
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => router.push("/ipd")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <Button variant="outline" size="sm" onClick={refreshStats} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  {viewMode === "search" ? (
                    <Button variant="outline" size="sm" onClick={() => setViewMode("admitted-patients")}>
                      <Users className="h-4 w-4 mr-2" />
                      Admitted Patients
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setViewMode("search")}>
                      <Search className="h-4 w-4 mr-2" />
                      Search Patients
                    </Button>
                  )}
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleNewAdmission}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Patient Admission
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards - Only show in search and admitted patients view */}
          {(viewMode === "search" || viewMode === "admitted-patients") && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Admissions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : dashboardStats?.totalAdmissions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active patients
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Admissions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : dashboardStats?.todaysAdmissions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">New admissions today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
                  <Activity className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {loading ? "..." : dashboardStats?.criticalPatients || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Require immediate attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : dashboardStats?.occupancyRate ? `${dashboardStats.occupancyRate}%` : "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Loading..." : `${dashboardStats?.todaysDischarges || 0} discharges today`}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content - Admitted Patients, Search or New Admission Form */}
          {viewMode === "admitted-patients" ? (
            <AdmittedPatientsList onPatientSelect={handlePatientSelect} />
          ) : viewMode === "search" ? (
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
                        Full admission process including patient registration, admission details, and payment
                        information
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    New Admission
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <EnhancedAdmissionForm onSubmit={handleAdmissionSuccess} onCancel={handleAdmissionCancel} />
              </CardContent>
            </Card>
          )}

          {/* Patient Details Modal */}
          <PatientDetailsModal
            patient={selectedAdmittedPatient}
            isOpen={showPatientModal}
            onClose={handleCloseModal}
          />
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
