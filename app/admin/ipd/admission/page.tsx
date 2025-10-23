"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, User, Search, Calendar, MapPin, DollarSign, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientSearch, AdmissionForm, NewPatientForm } from "@/components/ipd"
import { Patient } from "@/lib/ipd-types"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"

export default function AdmissionPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState("existing")
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
      setActiveTab("existing")
    }
  }, [searchParams])

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
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search Records
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
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

          {/* Main Admission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                New Patient Admission
              </CardTitle>
              <CardDescription>Select an existing patient or register a new patient for admission</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Existing Patient
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Patient
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-6">
                  <PatientSearch onPatientSelect={setSelectedPatient} selectedPatient={selectedPatient} />
                  {selectedPatient && <AdmissionForm patient={selectedPatient} isNewPatient={false} />}
                </TabsContent>

                <TabsContent value="new" className="space-y-6">
                  <NewPatientForm
                    onPatientCreated={patient => {
                      setSelectedPatient(patient)
                      setActiveTab("existing")
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
