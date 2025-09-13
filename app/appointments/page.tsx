"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { AppointmentDetails } from "@/components/appointments/appointment-details"
import { Plus } from "lucide-react"
import type { Appointment } from "@/lib/appointments"

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  const handleNewAppointment = () => {
    setEditingAppointment(null)
    setShowForm(true)
  }

  const handleEditAppointment = () => {
    setEditingAppointment(selectedAppointment)
    setShowDetails(false)
    setShowForm(true)
  }

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetails(true)
  }

  const handleFormSubmit = (appointmentData: Partial<Appointment>) => {
    // In a real app, this would save to the backend
    console.log("Saving appointment:", appointmentData)
    setShowForm(false)
    setEditingAppointment(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingAppointment(null)
  }

  const handleAppointmentCancel = () => {
    // In a real app, this would update the backend
    console.log("Cancelling appointment:", selectedAppointment?.id)
    setShowDetails(false)
    setSelectedAppointment(null)
  }

  const handleAppointmentComplete = () => {
    // In a real app, this would update the backend
    console.log("Completing appointment:", selectedAppointment?.id)
    setShowDetails(false)
    setSelectedAppointment(null)
  }

  return (
    <AuthProvider>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
              <p className="text-muted-foreground">Manage and schedule appointments</p>
            </div>
            <Button onClick={handleNewAppointment}>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>

          <AppointmentCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onAppointmentSelect={handleAppointmentSelect}
          />

          {/* New/Edit Appointment Dialog */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAppointment ? "Edit Appointment" : "Schedule New Appointment"}</DialogTitle>
              </DialogHeader>
              <AppointmentForm
                appointment={editingAppointment || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>

          {/* Appointment Details Dialog */}
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedAppointment && (
                <AppointmentDetails
                  appointment={selectedAppointment}
                  onEdit={handleEditAppointment}
                  onCancel={handleAppointmentCancel}
                  onComplete={handleAppointmentComplete}
                  onClose={() => setShowDetails(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
