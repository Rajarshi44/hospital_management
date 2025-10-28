"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-shell/app-layout"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Users, Clock, Activity } from "lucide-react"
import { ScheduleFiltersBar } from "@/components/doctors/schedule-filters-bar"
import { ScheduleTable } from "@/components/doctors/schedule-table"
import { ScheduleForm } from "@/components/doctors/schedule-form"
import { WorkingHoursView } from "@/components/doctors/working-hours-view"
import { DoctorWorkingHours } from "@/components/doctors/doctor-working-hours"
import { useSchedule, ScheduleFilters, Schedule, ScheduleFormData } from "@/hooks/doctor/use-schedule"
import { useDoctor } from "@/hooks/doctor/use-doctor"
import { useDepartments } from "@/hooks/doctor/use-departments"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DoctorSchedulesPage() {
  const {
    schedules,
    loading: schedulesLoading,
    error: schedulesError,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    fetchSchedules,
  } = useSchedule()
  
  const { doctors, fetchDoctors } = useDoctor()
  const { departments, fetchDepartments } = useDepartments()
  
  const [filters, setFilters] = useState<ScheduleFilters>({
    doctorId: undefined,
    departmentId: undefined,
    dayOfWeek: undefined,
    status: undefined,
  })
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState("schedules")
  const { toast } = useToast()

  // Load data on component mount
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      fetchSchedules()
      fetchDoctors()
      fetchDepartments()
    }
  }, [isInitialized]) // Only run when isInitialized changes

  // Filter schedules based on current filters
  const filteredSchedules = schedules.filter(schedule => {
    if (filters.doctorId && schedule.doctorId !== filters.doctorId) return false
    if (filters.departmentId && schedule.doctor?.primaryDepartment?.id !== filters.departmentId) return false
    if (filters.dayOfWeek && schedule.dayOfWeek !== filters.dayOfWeek.toLowerCase()) return false
    if (filters.status && schedule.status !== filters.status) return false
    return true
  })

  const handleSaveSchedule = async (formData: ScheduleFormData) => {
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, formData)
      } else {
        await createSchedule(formData)
      }
      setIsFormOpen(false)
      setEditingSchedule(null)
      // Refresh the schedules list
      fetchSchedules()
    } catch (error) {
      console.error('Error saving schedule:', error)
    }
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setIsFormOpen(true)
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      await deleteSchedule(scheduleId)
      // Refresh the schedules list
      fetchSchedules()
    }
  }

  const clearFilters = () => {
    setFilters({
      doctorId: undefined,
      departmentId: undefined,
      dayOfWeek: undefined,
      status: undefined,
    })
    // Fetch all schedules when clearing filters
    fetchSchedules()
  }

  const applyFilters = () => {
    fetchSchedules(filters)
  }

  const openNewScheduleForm = () => {
    setEditingSchedule(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingSchedule(null)
  }

  if (schedulesLoading && schedules.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-48">
            <div className="text-muted-foreground">Loading schedules...</div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (schedulesError) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>{schedulesError}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doctor Schedules</h1>
            <p className="text-muted-foreground">Manage doctor schedules, availability, and appointments</p>
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
                <ScheduleForm
                  schedule={editingSchedule || undefined}
                  doctors={doctors}
                  onSave={handleSaveSchedule}
                  onCancel={closeForm}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Filters */}
        <ScheduleFiltersBar 
          filters={filters} 
          doctors={doctors}
          departments={departments}
          onFiltersChange={setFilters} 
          onClearFilters={clearFilters}
          onApplyFilters={applyFilters}
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
                <p className="text-2xl font-bold">{schedules.filter(s => s.status?.toLowerCase() === "active").length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctors Scheduled</p>
                <p className="text-2xl font-bold">{new Set(schedules.map(s => s.doctorId)).size}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Hours/Day</p>
                <p className="text-2xl font-bold">
                  {schedules.length > 0 
                    ? Math.round(schedules.reduce((sum, s) => {
                        const start = parseInt(s.startTime.split(':')[0])
                        const end = parseInt(s.endTime.split(':')[0])
                        return sum + (end - start)
                      }, 0) / schedules.length)
                    : 0}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Schedules and Working Hours */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Doctor Schedules & Working Hours</h3>
          </div>
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="schedules">Active Schedules ({filteredSchedules.length})</TabsTrigger>
                <TabsTrigger value="working-hours">Schedule Overview</TabsTrigger>
                <TabsTrigger value="original-hours">Original Working Hours</TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedules" className="mt-6">
                <ScheduleTable
                  schedules={filteredSchedules}
                  onEdit={handleEditSchedule}
                  onDelete={handleDeleteSchedule}
                />
              </TabsContent>
              
              <TabsContent value="working-hours" className="mt-6">
                <WorkingHoursView schedules={filteredSchedules} />
              </TabsContent>
              
              <TabsContent value="original-hours" className="mt-6">
                <DoctorWorkingHours doctors={doctors} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
