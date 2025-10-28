"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, X } from "lucide-react"
import { ScheduleFilters } from "@/hooks/use-schedule"
import { Doctor } from "@/hooks/use-doctor"
import { Department } from "@/hooks/use-departments"

interface ScheduleFiltersBarProps {
  filters: ScheduleFilters
  doctors: Doctor[]
  departments: Department[]
  onFiltersChange: (filters: ScheduleFilters) => void
  onClearFilters: () => void
  onApplyFilters: () => void
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "TEMPORARY", label: "Temporary" },
]

export function ScheduleFiltersBar({
  filters,
  doctors,
  departments,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
}: ScheduleFiltersBarProps) {
  const updateFilter = (key: keyof ScheduleFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="doctor-filter" className="text-sm text-muted-foreground">
              Doctor:
            </label>
            <Select
              value={filters.doctorId || "all"}
              onValueChange={(value) => updateFilter("doctorId", value)}
            >
              <SelectTrigger id="doctor-filter" className="w-48">
                <SelectValue placeholder="All doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="department-filter" className="text-sm text-muted-foreground">
              Department:
            </label>
            <Select
              value={filters.departmentId || "all"}
              onValueChange={(value) => updateFilter("departmentId", value)}
            >
              <SelectTrigger id="department-filter" className="w-48">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="day-filter" className="text-sm text-muted-foreground">
              Day:
            </label>
            <Select
              value={filters.dayOfWeek || "all"}
              onValueChange={(value) => updateFilter("dayOfWeek", value)}
            >
              <SelectTrigger id="day-filter" className="w-36">
                <SelectValue placeholder="All days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All days</SelectItem>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-muted-foreground">
              Status:
            </label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger id="status-filter" className="w-36">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onApplyFilters}>
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}