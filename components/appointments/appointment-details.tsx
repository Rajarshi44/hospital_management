"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, User, Calendar, Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import type { Appointment } from "@/lib/appointments"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"

interface AppointmentDetailsProps {
  appointment: Appointment
  onEdit: () => void
  onCancel: () => void
  onComplete: () => void
  onClose: () => void
}

export function AppointmentDetails({ appointment, onEdit, onCancel, onComplete, onClose }: AppointmentDetailsProps) {
  const { user } = useAuth()

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
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const canEdit = user?.role !== "patient" && appointment.status !== "completed" && appointment.status !== "cancelled"
  const canCancel = appointment.status !== "completed" && appointment.status !== "cancelled"
  const canComplete = (user?.role === "doctor" || user?.role === "nurse") && appointment.status === "in-progress"

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Appointment Details
              <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
            </CardTitle>
            <CardDescription>{format(appointment.date, "EEEE, MMMM d, yyyy")}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Patient & Doctor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </h4>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {appointment.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{appointment.patientName}</p>
                <p className="text-sm text-muted-foreground">Patient ID: {appointment.patientId}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Doctor Information
            </h4>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {appointment.doctorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{appointment.doctorName}</p>
                <p className="text-sm text-muted-foreground">{appointment.department}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{format(appointment.date, "MMM d, yyyy")}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time:</span>
              <span>
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Location:</span>
              <span>{appointment.room || appointment.department}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Type:</span>
              <Badge variant="outline">{appointment.type}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className={`h-4 w-4 ${getPriorityColor(appointment.priority)}`} />
              <span className="font-medium">Priority:</span>
              <span className={getPriorityColor(appointment.priority)}>{appointment.priority}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Duration:</span>
              <span>{appointment.duration} minutes</span>
            </div>
          </div>
        </div>

        {/* Symptoms & Notes */}
        {appointment.symptoms && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Symptoms / Reason for Visit</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{appointment.symptoms}</p>
            </div>
          </>
        )}

        {appointment.notes && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Additional Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{appointment.notes}</p>
            </div>
          </>
        )}

        {/* Actions */}
        <Separator />
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {canComplete && (
            <Button onClick={onComplete} size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}

          {canCancel && (
            <Button onClick={onCancel} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
