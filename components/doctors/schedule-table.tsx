"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Clock, User, Building } from "lucide-react"
import { Schedule } from "@/hooks/use-schedule"

interface ScheduleTableProps {
  schedules: Schedule[]
  onEdit: (schedule: Schedule) => void
  onDelete: (scheduleId: string) => void
}

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const getDayDisplayName = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

const formatTime = (time: string) => {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const getStatusColor = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    case 'temporary':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

export function ScheduleTable({ schedules, onEdit, onDelete }: ScheduleTableProps) {
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
        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No schedules found</p>
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
            
            {/* Weekly Overview */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Weekly Schedule Overview
              </h5>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {DAYS_ORDER.map((day) => {
                  const daySchedule = doctorSchedules.find(s => s.dayOfWeek.toLowerCase() === day)
                  return (
                    <div key={day} className="text-center p-1">
                      <div className="font-medium capitalize text-muted-foreground">
                        {day.slice(0, 3)}
                      </div>
                      <div className="mt-1">
                        {daySchedule ? (
                          <div className="space-y-1">
                            <div className="text-xs font-medium">
                              {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs h-4 ${getStatusColor(daySchedule.status)}`}
                            >
                              {daySchedule.status || 'Active'}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">Off</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Working Hours Summary */}
              <div className="mt-3 pt-3 border-t border-muted text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Working Days:</span>
                  <span className="font-medium">{doctorSchedules.length} days/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Hours/Day:</span>
                  <span className="font-medium">
                    {doctorSchedules.length > 0 
                      ? Math.round(doctorSchedules.reduce((sum, s) => {
                          const start = parseInt(s.startTime.split(':')[0]) + parseInt(s.startTime.split(':')[1]) / 60
                          const end = parseInt(s.endTime.split(':')[0]) + parseInt(s.endTime.split(':')[1]) / 60
                          return sum + (end - start)
                        }, 0) / doctorSchedules.length * 10) / 10
                      : 0}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Patients/Week:</span>
                  <span className="font-medium">
                    {doctorSchedules.reduce((sum, s) => sum + (s.maxPatients || 0), 0)} max
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctorSchedules
                .sort((a, b) => {
                  const dayIndexA = DAYS_ORDER.indexOf(a.dayOfWeek.toLowerCase())
                  const dayIndexB = DAYS_ORDER.indexOf(b.dayOfWeek.toLowerCase())
                  return dayIndexA - dayIndexB
                })
                .map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{getDayDisplayName(schedule.dayOfWeek)}</h4>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status || 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>
                      
                      {schedule.breakStartTime && schedule.breakEndTime && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            Break: {formatTime(schedule.breakStartTime)} - {formatTime(schedule.breakEndTime)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Max: {schedule.maxPatients} patients</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>{schedule.consultationType || 'OPD'}</span>
                      </div>
                      
                      {schedule.notes && (
                        <div className="text-muted-foreground">
                          <p className="text-xs">{schedule.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(schedule)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(schedule.id)}
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}