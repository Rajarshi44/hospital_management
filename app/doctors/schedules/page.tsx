"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Calendar } from "lucide-react"
import { FiltersBar } from "@/components/doctors/filters-bar"
import { DoctorScheduleTable } from "@/components/doctors/doctor-schedule-table"
import { DoctorScheduleForm } from "@/components/doctors/doctor-schedule-form"
import { ScheduleFilters, Schedule, ScheduleFormData, Leave } from "@/lib/schedule-types"
import { mockSchedules, mockDoctors, mockLeaves } from "@/lib/schedule-mock-data"
import { useToast } from "@/hooks/use-toast"

export default function DoctorSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules)
  const [leaves, setLeaves] = useState<Leave[]>(mockLeaves)
  const [filters, setFilters] = useState<ScheduleFilters>({
    doctorId: 'all',
    departmentId: 'all',
    dayOfWeek: 'all',
    status: 'all'
  })
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { toast } = useToast()

  // Filter schedules based on current filters
  const filteredSchedules = schedules.filter(schedule => {
    if (filters.doctorId !== 'all' && schedule.doctorId !== filters.doctorId) return false
    if (filters.departmentId !== 'all') {
      const doctor = mockDoctors.find(d => d.id === schedule.doctorId)
      if (doctor?.departmentId !== filters.departmentId) return false
    }
    if (filters.dayOfWeek !== 'all' && !schedule.workingDays.includes(filters.dayOfWeek)) return false
    if (filters.status !== 'all' && schedule.status !== filters.status) return false
    return true
  })

  const handleSaveSchedule = (formData: ScheduleFormData) => {
    if (editingSchedule) {
      // Update existing schedule
      setSchedules(prev => prev.map(schedule => 
        schedule.id === editingSchedule.id
          ? {
              ...schedule,
              ...formData,
              doctorName: mockDoctors.find(d => d.id === formData.doctorId)?.name || '',
              departmentName: mockDoctors.find(d => d.id === formData.doctorId)?.departmentName || '',
              validTo: formData.validTo || 'always'
            }
          : schedule
      ))
      toast({
        title: "Schedule Updated",
        description: "Doctor schedule has been updated successfully.",
      })
    } else {
      // Create new schedule
      const newSchedule: Schedule = {
        id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        doctorName: mockDoctors.find(d => d.id === formData.doctorId)?.name || '',
        departmentName: mockDoctors.find(d => d.id === formData.doctorId)?.departmentName || '',
        validTo: formData.validTo || 'always',
        createdAt: new Date().toISOString()
      }
      setSchedules(prev => [...prev, newSchedule])
      toast({
        title: "Schedule Created",
        description: "New doctor schedule has been created successfully.",
      })
    }
    
    setIsFormOpen(false)
    setEditingSchedule(null)
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setIsFormOpen(true)
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    toast({
      title: "Schedule Deleted",
      description: "Doctor schedule has been deleted successfully.",
      variant: "destructive"
    })
  }

  const handleAddLeave = (doctorId: string, date: string, note: string) => {
    const newLeave: Leave = {
      id: `leave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      doctorId,
      date,
      note
    }
    setLeaves(prev => [...prev, newLeave])
    toast({
      title: "Leave Marked",
      description: "Doctor leave has been marked successfully.",
    })
  }

  const clearFilters = () => {
    setFilters({
      doctorId: 'all',
      departmentId: 'all',
      dayOfWeek: 'all',
      status: 'all'
    })
  }

  const openNewScheduleForm = () => {
    setEditingSchedule(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingSchedule(null)
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doctor Schedules</h1>
            <p className="text-muted-foreground">
              Manage doctor schedules, availability, and appointments
            </p>
          </div>
          <div className="flex gap-2">
            <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
              <SheetTrigger asChild>
                <Button onClick={openNewScheduleForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Schedule
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <DoctorScheduleForm
                  schedule={editingSchedule || undefined}
                  existingSchedules={schedules}
                  onSave={handleSaveSchedule}
                  onCancel={closeForm}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Filters */}
        <FiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
        />

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold">
                  {schedules.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctors Scheduled</p>
                <p className="text-2xl font-bold">
                  {new Set(schedules.map(s => s.doctorId)).size}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leaves Marked</p>
                <p className="text-2xl font-bold">{leaves.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">
              Schedules ({filteredSchedules.length})
            </h3>
          </div>
          <div className="p-4">
            <DoctorScheduleTable
              schedules={filteredSchedules}
              onEdit={handleEditSchedule}
              onDelete={handleDeleteSchedule}
              onAddLeave={handleAddLeave}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}