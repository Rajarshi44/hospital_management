"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X, AlertTriangle, Clock } from "lucide-react"
import { ScheduleFormData, Schedule } from "@/lib/schedule-types"
import { mockDoctors, DAYS_OF_WEEK, SLOT_DURATIONS, CONSULTATION_MODES } from "@/lib/schedule-mock-data"
import { TimeSlotPreview } from "./time-slot-preview"
import { DoctorSearchDropdown } from "./doctor-search-dropdown"

const scheduleFormSchema = z
  .object({
    doctorId: z.string().min(1, "Please select a doctor"),
    workingDays: z.array(z.string()).min(1, "Please select at least one working day"),
    startTime: z.string().min(1, "Please enter start time"),
    endTime: z.string().min(1, "Please enter end time"),
    slotDuration: z.number().min(10, "Slot duration must be at least 10 minutes"),
    maxPatientsPerSession: z.number().min(1, "Must allow at least 1 patient per session"),
    consultationMode: z.enum(["in-person", "online", "both"]),
    roomNumber: z.string().optional(),
    validFrom: z.string().min(1, "Please enter valid from date"),
    validTo: z.string().optional(),
    status: z.enum(["active", "inactive"]),
  })
  .refine(
    data => {
      if (data.consultationMode === "in-person" || data.consultationMode === "both") {
        return data.roomNumber && data.roomNumber.length > 0
      }
      return true
    },
    {
      message: "Room number is required for in-person consultations",
      path: ["roomNumber"],
    }
  )
  .refine(
    data => {
      const start = new Date(`2000-01-01T${data.startTime}:00`)
      const end = new Date(`2000-01-01T${data.endTime}:00`)
      return start < end
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )

interface DoctorScheduleFormProps {
  schedule?: Schedule
  existingSchedules: Schedule[]
  onSave: (data: ScheduleFormData) => void
  onCancel: () => void
}

export function DoctorScheduleForm({ schedule, existingSchedules, onSave, onCancel }: DoctorScheduleFormProps) {
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      doctorId: schedule?.doctorId || "",
      workingDays: schedule?.workingDays || [],
      startTime: schedule?.startTime || "",
      endTime: schedule?.endTime || "",
      slotDuration: schedule?.slotDuration || 30,
      maxPatientsPerSession: schedule?.maxPatientsPerSession || 10,
      consultationMode: schedule?.consultationMode || "in-person",
      roomNumber: schedule?.roomNumber || "",
      validFrom: schedule?.validFrom || new Date().toISOString().split("T")[0],
      validTo: schedule?.validTo === "always" ? "" : schedule?.validTo || "",
      status: schedule?.status || "active",
    },
  })

  const watchedValues = form.watch()
  const selectedDoctor = mockDoctors.find(d => d.id === watchedValues.doctorId)

  // Check for schedule overlaps
  const checkOverlaps = (formData: ScheduleFormData) => {
    if (!formData.doctorId || !formData.startTime || !formData.endTime) return []

    const overlaps = existingSchedules.filter(existing => {
      if (existing.id === schedule?.id) return false // Don't check against self when editing
      if (existing.doctorId !== formData.doctorId) return false
      if (existing.status === "inactive") return false

      // Check if any working days overlap
      const hasCommonDay = existing.workingDays.some(day => formData.workingDays.includes(day))
      if (!hasCommonDay) return false

      // Check time overlap
      const existingStart = new Date(`2000-01-01T${existing.startTime}:00`)
      const existingEnd = new Date(`2000-01-01T${existing.endTime}:00`)
      const newStart = new Date(`2000-01-01T${formData.startTime}:00`)
      const newEnd = new Date(`2000-01-01T${formData.endTime}:00`)

      return newStart < existingEnd && newEnd > existingStart
    })

    return overlaps
  }

  const overlappingSchedules = checkOverlaps(watchedValues)

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    const currentDays = form.getValues("workingDays")
    if (checked) {
      form.setValue("workingDays", [...currentDays, day])
    } else {
      form.setValue(
        "workingDays",
        currentDays.filter(d => d !== day)
      )
    }
  }

  const onSubmit = (data: ScheduleFormData) => {
    // Block submission if there are overlaps (you can make this a warning instead)
    if (overlappingSchedules.length > 0) {
      return // Don't submit if there are overlaps
    }
    onSave(data)
  }

  const formatWorkingDaysPreview = (days: string[]) => {
    if (days.length === 0) return "No days selected"

    const dayLabels = days.map(day => DAYS_OF_WEEK.find(d => d.value === day)?.short || day)

    return dayLabels.join(", ")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{schedule ? "Edit Schedule" : "Add New Schedule"}</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Doctor Selection */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field, fieldState }) => (
              <FormItem>
                <DoctorSearchDropdown
                  value={field.value || ""}
                  onValueChange={value => {
                    console.log("Form field onChange called with:", value)
                    field.onChange(value)
                  }}
                  placeholder="Choose a doctor"
                  error={fieldState.error?.message}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Working Days */}
          <FormField
            control={form.control}
            name="workingDays"
            render={() => (
              <FormItem>
                <FormLabel>Working Days</FormLabel>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <FormField
                      key={day.value}
                      control={form.control}
                      name="workingDays"
                      render={({ field }) => (
                        <FormItem key={day.value} className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={checked => handleWorkingDayChange(day.value, checked as boolean)}
                            />
                          </FormControl>
                          <Label className="text-sm font-normal">{day.short}</Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Selected: {formatWorkingDaysPreview(watchedValues.workingDays)}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* OPD Timings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">OPD Timings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slotDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slot Duration</FormLabel>
                      <Select onValueChange={value => field.onChange(parseInt(value))} value={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SLOT_DURATIONS.map(duration => (
                            <SelectItem key={duration.value} value={duration.value.toString()}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPatientsPerSession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Patients per Session</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Slot Preview */}
          <TimeSlotPreview
            startTime={watchedValues.startTime}
            endTime={watchedValues.endTime}
            slotDuration={watchedValues.slotDuration}
            maxPatientsPerSession={watchedValues.maxPatientsPerSession}
          />

          {/* Consultation Mode */}
          <FormField
            control={form.control}
            name="consultationMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consultation Mode</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONSULTATION_MODES.map(mode => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room Number */}
          {(watchedValues.consultationMode === "in-person" || watchedValues.consultationMode === "both") && (
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room / OPD Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., C-101, OPD-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid To (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} placeholder="Leave empty for always" />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">Leave empty for permanent schedule</div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">Enable this schedule for appointments</div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === "active"}
                    onCheckedChange={checked => field.onChange(checked ? "active" : "inactive")}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Overlap Warning */}
          {overlappingSchedules.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Schedule Conflict Detected</div>
                <div className="text-sm">
                  This schedule overlaps with existing schedules:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {overlappingSchedules.map(existing => (
                      <li key={existing.id}>
                        {existing.workingDays.join(", ")} • {existing.startTime} - {existing.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={overlappingSchedules.length > 0}>
              {schedule ? "Update Schedule" : "Save Schedule"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
