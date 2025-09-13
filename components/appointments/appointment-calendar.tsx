"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MapPin } from "lucide-react"
import { getAppointmentsByDate, type Appointment } from "@/lib/appointments"
import { format } from "date-fns"

interface AppointmentCalendarProps {
  onDateSelect: (date: Date) => void
  onAppointmentSelect: (appointment: Appointment) => void
  selectedDate?: Date
}

export function AppointmentCalendar({ onDateSelect, onAppointmentSelect, selectedDate }: AppointmentCalendarProps) {
  const [date, setDate] = useState<Date>(selectedDate || new Date())
  const appointments = getAppointmentsByDate(date)

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      onDateSelect(newDate)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no-show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500"
      case "high":
        return "border-l-orange-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Select a date to view appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" selected={date} onSelect={handleDateChange} className="rounded-md border" />
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Appointments for {format(date, "MMMM d, yyyy")}</CardTitle>
          <CardDescription>
            {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 rounded-lg border-l-4 bg-card hover:bg-accent/50 cursor-pointer transition-colors ${getPriorityColor(appointment.priority)}`}
                    onClick={() => onAppointmentSelect(appointment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {appointment.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{appointment.patientName}</h4>
                            <p className="text-sm text-muted-foreground">{appointment.doctorName}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {appointment.startTime} - {appointment.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.room || appointment.department}</span>
                          </div>
                        </div>

                        {appointment.symptoms && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            <strong>Symptoms:</strong> {appointment.symptoms}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {appointment.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
