"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, Building, Calendar, RefreshCw, Edit, Save, X } from "lucide-react"
import { useDoctor, Doctor } from "@/hooks/doctor/use-doctor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface DoctorWorkingHoursProps {
  doctors: Doctor[]
}

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const getDayDisplayName = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

const formatTime = (time: string) => {
  if (!time) return "Not set"
  
  // Handle both 12-hour and 24-hour formats
  if (time.includes('AM') || time.includes('PM')) {
    return time
  }
  
  // Convert 24-hour to 12-hour format
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

interface EditableWorkingHoursRowProps {
  day: string
  isWorking: boolean
  workingHours: any
  doctorId: string
  onUpdate: () => void
}

function EditableWorkingHoursRow({ day, isWorking, workingHours, doctorId, onUpdate }: EditableWorkingHoursRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    startTime: workingHours.startTime || "09:00",
    endTime: workingHours.endTime || "17:00",
    maxPatients: workingHours.maxPatients || 20,
    consultationType: workingHours.consultationType || "OPD",
    isWorking: isWorking
  })
  const { updateDoctor } = useDoctor()
  const { toast } = useToast()

  const handleSave = async () => {
    try {
      // Update the working hours JSON
      const currentDays = workingHours.days || []
      let newDays = [...currentDays]
      
      if (editData.isWorking && !newDays.includes(day.toLowerCase())) {
        newDays.push(day.toLowerCase())
      } else if (!editData.isWorking && newDays.includes(day.toLowerCase())) {
        newDays = newDays.filter(d => d !== day.toLowerCase())
      }

      const newWorkingHours = {
        ...workingHours,
        days: newDays,
        startTime: editData.startTime,
        endTime: editData.endTime,
        maxPatients: editData.maxPatients,
        consultationType: editData.consultationType
      }

      await updateDoctor(doctorId, {
        workingHours: JSON.stringify(newWorkingHours)
      })

      toast({
        title: "Success",
        description: "Working hours updated successfully",
      })

      setIsEditing(false)
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update working hours",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditData({
      startTime: workingHours.startTime || "09:00",
      endTime: workingHours.endTime || "17:00",
      maxPatients: workingHours.maxPatients || 20,
      consultationType: workingHours.consultationType || "OPD",
      isWorking: isWorking
    })
    setIsEditing(false)
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {getDayDisplayName(day)}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={editData.startTime}
              onChange={(e) => setEditData({...editData, startTime: e.target.value})}
              className="w-24"
              disabled={!editData.isWorking}
            />
            <span>-</span>
            <Input
              type="time"
              value={editData.endTime}
              onChange={(e) => setEditData({...editData, endTime: e.target.value})}
              className="w-24"
              disabled={!editData.isWorking}
            />
          </div>
        ) : (
          <>
            {isWorking ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  {formatTime(workingHours.startTime)} - {formatTime(workingHours.endTime)}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">Off</span>
            )}
          </>
        )}
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">No break set</span>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            value={editData.maxPatients}
            onChange={(e) => setEditData({...editData, maxPatients: parseInt(e.target.value)})}
            className="w-20"
            disabled={!editData.isWorking}
          />
        ) : (
          <span>{isWorking ? workingHours.maxPatients || 'Not set' : '-'}</span>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select
            value={editData.consultationType}
            onValueChange={(value) => setEditData({...editData, consultationType: value})}
            disabled={!editData.isWorking}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPD">OPD</SelectItem>
              <SelectItem value="IPD">IPD</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline">
            {isWorking ? workingHours.consultationType || 'OPD' : '-'}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select
            value={editData.isWorking ? "working" : "off"}
            onValueChange={(value) => setEditData({...editData, isWorking: value === "working"})}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="off">Off</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <>
            {isWorking ? (
              <Badge variant="default">Working</Badge>
            ) : (
              <Badge variant="secondary">Off</Badge>
            )}
          </>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export function DoctorWorkingHours({ doctors }: DoctorWorkingHoursProps) {
  const { getWorkingHours } = useDoctor()
  const [workingHoursData, setWorkingHoursData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllWorkingHours = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const workingHoursPromises = doctors.map(async (doctor) => {
        const data = await getWorkingHours(doctor.id)
        return { doctorId: doctor.id, ...data }
      })
      
      const results = await Promise.all(workingHoursPromises)
      const workingHoursMap = results.reduce((acc, result) => {
        acc[result.doctorId] = result
        return acc
      }, {} as Record<string, any>)
      
      setWorkingHoursData(workingHoursMap)
    } catch (err) {
      setError('Failed to fetch working hours data')
      console.error('Error fetching working hours:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchAllWorkingHours()
    }
  }, [doctors])

  if (loading && Object.keys(workingHoursData).length === 0) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground mb-4 animate-spin" />
        <p className="text-muted-foreground">Loading working hours...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No doctors found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Original Working Hours (From Registration)</h3>
        <Button variant="outline" size="sm" onClick={fetchAllWorkingHours} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {doctors.map((doctor) => {
        const doctorData = workingHoursData[doctor.id]
        const workingHours = doctorData?.workingHours || {}
        
        return (
          <Card key={doctor.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dr. {doctor.firstName} {doctor.lastName}
                <Badge variant="outline" className="ml-2">
                  {doctor.specialization}
                </Badge>
                {doctor.primaryDepartment && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {doctor.primaryDepartment.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(workingHours).length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No working hours configured</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Working hours were not set during registration
                  </p>
                </div>
              ) : (
                <>
                  {/* Working Hours Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Working Hours</TableHead>
                        <TableHead>Break Time</TableHead>
                        <TableHead>Max Patients</TableHead>
                        <TableHead>Consultation Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DAYS_ORDER.map((day) => {
                        // Handle the new format: check if this day is in the working days array
                        const workingDays = workingHours.days || []
                        const isWorking = workingDays.includes(day) || workingDays.includes(day.toLowerCase())
                        
                        return (
                          <EditableWorkingHoursRow
                            key={day}
                            day={day}
                            isWorking={isWorking}
                            workingHours={workingHours}
                            doctorId={doctor.id}
                            onUpdate={() => fetchAllWorkingHours()}
                          />
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* Summary Statistics */}
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Weekly Summary (From Registration Data)
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Working Days:</span>
                        <div className="font-semibold">
                          {(workingHours.days || []).length} days
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Daily Hours:</span>
                        <div className="font-semibold">
                          {(() => {
                            if (!workingHours.startTime || !workingHours.endTime) return "0h"
                            try {
                              const start = parseInt(workingHours.startTime.split(':')[0]) + 
                                           parseInt(workingHours.startTime.split(':')[1]) / 60
                              const end = parseInt(workingHours.endTime.split(':')[0]) + 
                                         parseInt(workingHours.endTime.split(':')[1]) / 60
                              return `${(end - start).toFixed(1)}h`
                            } catch {
                              return "0h"
                            }
                          })()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Patients/Day:</span>
                        <div className="font-semibold">
                          {workingHours.maxPatients || 0}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Consultation Type:</span>
                        <div className="font-semibold">
                          {workingHours.consultationType || "Not set"}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}