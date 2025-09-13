"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { PatientSearch } from "@/components/patients/patient-search"
import { PatientProfile } from "@/components/patients/patient-profile"
import type { Patient } from "@/lib/patients"

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const handleNewPatient = () => {
    setShowNewPatientForm(true)
  }

  const handleEditPatient = () => {
    // In a real app, this would open an edit form
    console.log("Edit patient:", selectedPatient?.id)
  }

  const handleCloseProfile = () => {
    setSelectedPatient(null)
  }

  return (
    <AuthProvider>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
            <p className="text-muted-foreground">Search, view, and manage patient records</p>
          </div>

          {selectedPatient ? (
            <PatientProfile patient={selectedPatient} onEdit={handleEditPatient} onClose={handleCloseProfile} />
          ) : (
            <PatientSearch onPatientSelect={handlePatientSelect} onNewPatient={handleNewPatient} />
          )}
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
