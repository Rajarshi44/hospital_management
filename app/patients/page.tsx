"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { PatientSearch } from "@/components/patients/patient-search"
import { PatientList } from "@/components/patients/patient-list"
import { PatientDetails } from "@/components/patients/patient-details"
import { OPDVisitForm } from "@/components/opd/opd-visit-form"
import type { Patient } from "@/lib/patient-service"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus, Stethoscope } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ViewMode = "search" | "details" | "opd-form"

export default function PatientsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("search")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("opd-list")

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setViewMode("details")
  }

  const handleNewOPDVisit = () => {
    setViewMode("opd-form")
  }

  const handleOPDSuccess = (visitId: string) => {
    setViewMode("search")
    setRefreshTrigger(prev => prev + 1)
  }

  const handleOPDCancel = () => {
    setViewMode("search")
  }

  const handleBack = () => {
    setSelectedPatient(null)
    setViewMode("search")
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <AuthProvider>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
              <p className="text-muted-foreground">Search, view, and manage patient records</p>
            </div>
            {(viewMode === "details" || viewMode === "opd-form") && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            )}
          </div>

          {viewMode === "search" && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="opd-list" className="gap-2">
                    <Stethoscope className="h-4 w-4" />
                    OPD Patients
                  </TabsTrigger>
                  <TabsTrigger value="all-patients" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    All Patients
                  </TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                  {activeTab === "opd-list" && (
                    <Button onClick={handleNewOPDVisit} size="default">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      New OPD Visit
                    </Button>
                  )}
                </div>
              </div>

              <TabsContent value="opd-list" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>OPD Patient Visits</CardTitle>
                        <CardDescription>
                          Outpatient department consultations and visits
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        Today: 0
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No OPD visits recorded yet</h3>
                      <p className="mb-4">Click the button below to start recording OPD patient visits</p>
                      <Button onClick={handleNewOPDVisit} variant="default" size="lg">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        New OPD Visit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="all-patients" className="space-y-4">
                <PatientSearch
                  onPatientSelect={handlePatientSelect}
                  refreshTrigger={refreshTrigger}
                />
                <PatientList
                  onPatientSelect={handlePatientSelect}
                  refreshTrigger={refreshTrigger}
                />
              </TabsContent>
            </Tabs>
          )}

          {viewMode === "details" && selectedPatient && (
            <PatientDetails patient={selectedPatient} onClose={handleBack} />
          )}

          {viewMode === "opd-form" && (
            <div className="space-y-6">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Stethoscope className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold">New OPD Patient Visit</CardTitle>
                        <CardDescription className="text-base mt-1">
                          Complete outpatient consultation form. All sections are collapsible for easy navigation.
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      Auto-saves every 30s
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <OPDVisitForm onSuccess={handleOPDSuccess} onCancel={handleOPDCancel} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
