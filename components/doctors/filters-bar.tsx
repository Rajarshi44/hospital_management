"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScheduleFilters } from "@/lib/schedule-types"
import { mockDoctors, mockDepartments, DAYS_OF_WEEK } from "@/lib/schedule-mock-data"

interface FiltersBarProps {
  filters: ScheduleFilters
  onFiltersChange: (filters: ScheduleFilters) => void
  onClearFilters: () => void
}

export function FiltersBar({ filters, onFiltersChange, onClearFilters }: FiltersBarProps) {
  const activeFiltersCount = Object.values(filters).filter(value => value && value !== "all").length

  const handleFilterChange = (key: keyof ScheduleFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doctor Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Doctor</label>
          <Select value={filters.doctorId} onValueChange={value => handleFilterChange("doctorId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>
              {mockDoctors.map(doctor => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Department</label>
          <Select value={filters.departmentId} onValueChange={value => handleFilterChange("departmentId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {mockDepartments.map(department => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Day of Week Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Day of Week</label>
          <Select value={filters.dayOfWeek} onValueChange={value => handleFilterChange("dayOfWeek", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All days</SelectItem>
              {DAYS_OF_WEEK.map(day => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value: "all" | "active" | "inactive") => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
