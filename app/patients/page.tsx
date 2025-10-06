"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { PatientSearch } from "@/components/patients/patient-search"
import { PatientList } from "@/components/patients/patient-list"
import { PatientForm } from "@/components/patients/patient-form"
import { PatientDetails } from "@/components/patients/patient-details"
import type { Patient } from "@/lib/patient-service"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type ViewMode = "search" | "form" | "details" | "edit"

export default function PatientsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("search")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setViewMode("details")
  }

  const handleNewPatient = () => {
    setSelectedPatient(null)
    setViewMode("form")
  }

  const handleEditPatient = () => {
    setViewMode("edit")
  }

  const handleFormSuccess = (patient: Patient) => {
    setSelectedPatient(patient)
    setViewMode("details")
    // Trigger refresh of patient list
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleFormCancel = () => {
    if (selectedPatient) {
      setViewMode("details")
    } else {
      setViewMode("search")
    }
  }

  const handleBack = () => {
    setSelectedPatient(null)
    setViewMode("search")
    setRefreshTrigger((prev) => prev + 1)
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
            {(viewMode === "details" || viewMode === "form" || viewMode === "edit") && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            )}
          </div>

          {viewMode === "search" && (
            <>
              <PatientSearch
                onPatientSelect={handlePatientSelect}
                onNewPatient={handleNewPatient}
                refreshTrigger={refreshTrigger}
              />
              <PatientList
                onPatientSelect={handlePatientSelect}
                onNewPatient={handleNewPatient}
                refreshTrigger={refreshTrigger}
              />
            </>
          )}

          {(viewMode === "form" || viewMode === "edit") && (
            <PatientForm
              patient={viewMode === "edit" ? selectedPatient || undefined : undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}

          {viewMode === "details" && selectedPatient && (
            <PatientDetails
              patient={selectedPatient}
              onEdit={handleEditPatient}
              onClose={handleBack}
            />
          )}
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
