"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "./date-picker"
import { mockDoctors, generateTimeSlots, type Appointment } from "@/lib/appointments"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface AppointmentFormProps {
  appointment?: Appointment
  onSubmit: (appointment: Partial<Appointment>) => void
  onCancel: () => void
}

export function AppointmentForm({ appointment, onSubmit, onCancel }: AppointmentFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    patientName: appointment?.patientName || "",
    doctorId: appointment?.doctorId || "",
    date: appointment?.date || undefined,
    startTime: appointment?.startTime || "",
    type: appointment?.type || "consultation",
    priority: appointment?.priority || "medium",
    symptoms: appointment?.symptoms || "",
    notes: appointment?.notes || "",
  })

  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; available: boolean }>>([])

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, date, startTime: "" }))

    if (date && formData.doctorId) {
      const slots = generateTimeSlots(date, formData.doctorId)
      setAvailableSlots(slots)
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    setFormData((prev) => ({ ...prev, doctorId, startTime: "" }))

    if (formData.date && doctorId) {
      const slots = generateTimeSlots(formData.date, doctorId)
      setAvailableSlots(slots)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date || !formData.doctorId || !formData.startTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const doctor = mockDoctors.find((d) => d.id === formData.doctorId)
    const endTime = calculateEndTime(formData.startTime, 30) // 30 min default

    const appointmentData: Partial<Appointment> = {
      ...formData,
      doctorName: doctor?.name || "",
      department: doctor?.department || "",
      endTime,
      duration: 30,
      status: "scheduled",
    }

    onSubmit(appointmentData)

    toast({
      title: "Appointment Scheduled",
      description: `Appointment with ${doctor?.name} has been scheduled for ${formData.date.toLocaleDateString()}.`,
    })
  }

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const endMinutes = minutes + duration
    const endHours = hours + Math.floor(endMinutes / 60)
    const finalMinutes = endMinutes % 60

    return `${endHours.toString().padStart(2, "0")}:${finalMinutes.toString().padStart(2, "0")}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{appointment ? "Edit Appointment" : "Schedule New Appointment"}</CardTitle>
        <CardDescription>
          {user?.role === "patient"
            ? "Book an appointment with a healthcare provider"
            : "Schedule an appointment for a patient"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
                placeholder="Enter patient name"
                required
                disabled={user?.role === "patient"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select value={formData.doctorId} onValueChange={handleDoctorChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {mockDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex flex-col">
                        <span>{doctor.name}</span>
                        <span className="text-xs text-muted-foreground">{doctor.specialization}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker date={formData.date} onDateChange={handleDateChange} placeholder="Select appointment date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Select
                value={formData.startTime}
                onValueChange={(time) => setFormData((prev) => ({ ...prev, startTime: time }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.time} value={slot.time} disabled={!slot.available}>
                      <div className="flex items-center justify-between w-full">
                        <span>{slot.time}</span>
                        {!slot.available && (
                          <Badge variant="secondary" className="ml-2">
                            Booked
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select
                value={formData.type}
                onValueChange={(type) => setFormData((prev) => ({ ...prev, type: type as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(priority) => setFormData((prev) => ({ ...prev, priority: priority as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms / Reason for Visit</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
              placeholder="Describe symptoms or reason for the appointment"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes or special requirements"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {appointment ? "Update Appointment" : "Schedule Appointment"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
