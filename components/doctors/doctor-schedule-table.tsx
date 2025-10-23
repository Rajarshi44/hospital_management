"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal, Calendar, MapPin, Clock } from "lucide-react"
import { Schedule } from "@/lib/schedule-types"
import { DAYS_OF_WEEK } from "@/lib/schedule-mock-data"
import { LeaveModal } from "@/components/doctors/leave-modal"

interface DoctorScheduleTableProps {
  schedules: Schedule[]
  onEdit: (schedule: Schedule) => void
  onDelete: (scheduleId: string) => void
  onAddLeave: (doctorId: string, date: string, note: string) => void
}

export function DoctorScheduleTable({ schedules, onEdit, onDelete, onAddLeave }: DoctorScheduleTableProps) {
  const [selectedScheduleForLeave, setSelectedScheduleForLeave] = useState<Schedule | null>(null)

  const formatWorkingDays = (days: string[]) => {
    if (days.length === 0) return "No days"

    const dayLabels = days.map(day => DAYS_OF_WEEK.find(d => d.value === day)?.short || day)

    // Try to create ranges for consecutive days
    const sortedDays = days.sort((a, b) => {
      const aIndex = DAYS_OF_WEEK.findIndex(d => d.value === a)
      const bIndex = DAYS_OF_WEEK.findIndex(d => d.value === b)
      return aIndex - bIndex
    })

    if (
      sortedDays.length >= 5 &&
      sortedDays.includes("monday") &&
      sortedDays.includes("tuesday") &&
      sortedDays.includes("wednesday") &&
      sortedDays.includes("thursday") &&
      sortedDays.includes("friday")
    ) {
      return "Mon-Fri"
    }

    return dayLabels.join(", ")
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? "PM" : "AM"
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status === "active" ? "Active" : "Inactive"}
      </Badge>
    )
  }

  const getModeBadge = (mode: string) => {
    const variants = {
      "in-person": "default",
      online: "secondary",
      both: "outline",
    } as const

    const labels = {
      "in-person": "In-person",
      online: "Online",
      both: "Both",
    } as const

    return (
      <Badge variant={variants[mode as keyof typeof variants] || "default"}>
        {labels[mode as keyof typeof labels] || mode}
      </Badge>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No schedules found</h3>
        <p className="text-muted-foreground">Get started by creating a new schedule.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Room/Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map(schedule => (
              <TableRow key={schedule.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{schedule.doctorName}</div>
                    <div className="text-sm text-muted-foreground">
                      {schedule.slotDuration}min slots • Max {schedule.maxPatientsPerSession} patients
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{schedule.departmentName}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatWorkingDays(schedule.workingDays)}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-mono text-sm">
                    <Clock className="h-3 w-3" />
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </div>
                </TableCell>
                <TableCell>{getModeBadge(schedule.consultationMode)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {schedule.roomNumber || "N/A"}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(schedule)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedScheduleForLeave(schedule)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Mark Leave/Holiday
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(schedule.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Schedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Leave Modal */}
      {selectedScheduleForLeave && (
        <LeaveModal
          doctorName={selectedScheduleForLeave.doctorName}
          onSave={(date: string, note: string) => {
            onAddLeave(selectedScheduleForLeave.doctorId, date, note)
            setSelectedScheduleForLeave(null)
          }}
          onCancel={() => setSelectedScheduleForLeave(null)}
        />
      )}
    </>
  )
}
