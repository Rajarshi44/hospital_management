"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TimeSlot } from "@/lib/schedule-types"

interface TimeSlotPreviewProps {
  startTime: string
  endTime: string
  slotDuration: number
  maxPatientsPerSession: number
}

export function TimeSlotPreview({ startTime, endTime, slotDuration, maxPatientsPerSession }: TimeSlotPreviewProps) {
  const generateTimeSlots = (): TimeSlot[] => {
    if (!startTime || !endTime || !slotDuration) return []

    const slots: TimeSlot[] = []
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)

    let current = new Date(start)

    while (current < end) {
      const slotStart = current.toTimeString().substring(0, 5)
      current.setMinutes(current.getMinutes() + slotDuration)
      const slotEnd = current.toTimeString().substring(0, 5)

      if (current <= end) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: true,
        })
      }
    }

    return slots
  }

  const timeSlots = generateTimeSlots()
  const totalSlots = timeSlots.length
  const totalCapacity = totalSlots * maxPatientsPerSession

  if (timeSlots.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Slot Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set start time, end time, and slot duration to preview time slots
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Slot Preview
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{totalSlots} slots</Badge>
          <Badge variant="outline">{totalCapacity} max patients</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-sm text-sm">
              <span className="font-mono">
                {slot.startTime} - {slot.endTime}
              </span>
              <Badge variant="secondary" className="text-xs">
                {maxPatientsPerSession} patients
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Duration per slot:</span>
              <div className="font-medium">{slotDuration} minutes</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total duration:</span>
              <div className="font-medium">
                {Math.floor((timeSlots.length * slotDuration) / 60)}h {(timeSlots.length * slotDuration) % 60}m
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
