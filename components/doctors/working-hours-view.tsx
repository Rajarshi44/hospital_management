"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, User, Building, Calendar } from "lucide-react"
import { Schedule } from "@/hooks/use-schedule"

interface WorkingHoursViewProps {
  schedules: Schedule[]
}

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const getDayDisplayName = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function WorkingHoursView({ schedules }: WorkingHoursViewProps) {
  // Group schedules by doctor
  const schedulesByDoctor = schedules.reduce((acc, schedule) => {
    const doctorKey = schedule.doctorId
    if (!acc[doctorKey]) {
      acc[doctorKey] = {
        doctor: schedule.doctor,
        schedules: []
      }
    }
    acc[doctorKey].schedules.push(schedule)
    return acc
  }, {} as Record<string, { doctor: Schedule['doctor'], schedules: Schedule[] }>)

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No working hours scheduled</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(schedulesByDoctor).map(([doctorId, { doctor, schedules: doctorSchedules }]) => (
        <Card key={doctorId}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dr. {doctor?.firstName} {doctor?.lastName}
              <Badge variant="outline" className="ml-2">
                {doctor?.specialization}
              </Badge>
              {doctor?.primaryDepartment && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {doctor.primaryDepartment.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Working Hours Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Break Time</TableHead>
                  <TableHead>Max Patients</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DAYS_ORDER.map((day) => {
                  const daySchedule = doctorSchedules.find(s => s.dayOfWeek.toLowerCase() === day)
                  return (
                    <TableRow key={day}>
                      <TableCell className="font-medium">
                        {getDayDisplayName(day)}
                      </TableCell>
                      <TableCell>
                        {daySchedule ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Off</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {daySchedule?.breakStartTime && daySchedule?.breakEndTime ? (
                          <span className="text-sm">
                            {formatTime(daySchedule.breakStartTime)} - {formatTime(daySchedule.breakEndTime)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No break</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {daySchedule ? (
                          <span>{daySchedule.maxPatients}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {daySchedule ? (
                          <Badge variant="outline">
                            {daySchedule.consultationType || 'OPD'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {daySchedule ? (
                          <Badge 
                            variant={daySchedule.status?.toLowerCase() === 'active' ? 'default' : 'secondary'}
                          >
                            {daySchedule.status || 'Active'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Off</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Summary Statistics */}
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Weekly Summary
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Working Days:</span>
                  <div className="font-semibold">{doctorSchedules.length} days</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Hours:</span>
                  <div className="font-semibold">
                    {doctorSchedules.reduce((sum, s) => {
                      const start = parseInt(s.startTime.split(':')[0]) + parseInt(s.startTime.split(':')[1]) / 60
                      const end = parseInt(s.endTime.split(':')[0]) + parseInt(s.endTime.split(':')[1]) / 60
                      return sum + (end - start)
                    }, 0).toFixed(1)}h
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Patients/Week:</span>
                  <div className="font-semibold">
                    {doctorSchedules.reduce((sum, s) => sum + (s.maxPatients || 0), 0)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Consultation Types:</span>
                  <div className="font-semibold">
                    {[...new Set(doctorSchedules.map(s => s.consultationType || 'OPD'))].join(', ')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}