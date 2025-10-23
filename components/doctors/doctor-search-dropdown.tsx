"use client"

import { useState, useMemo } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Doctor } from "@/lib/schedule-types"
import { mockDoctors, mockDepartments } from "@/lib/schedule-mock-data"

interface DoctorSearchDropdownProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  error?: string
}

export function DoctorSearchDropdown({ value, onValueChange, placeholder = "Choose a doctor", error }: DoctorSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const selectedDoctor = mockDoctors.find(doctor => doctor.id === value)

  // Get unique specializations for filter
  const specializations = useMemo(() => {
    try {
      const specs = [...new Set(mockDoctors.map(doctor => doctor.specialization).filter(Boolean))].sort()
      return specs
    } catch (error) {
      console.error('Error getting specializations:', error)
      return []
    }
  }, [])

  const filteredDoctors = useMemo(() => {
    try {
      let filtered = mockDoctors || []

      // Filter by department
      if (selectedDepartment !== "all") {
        filtered = filtered.filter(doctor => doctor.departmentId === selectedDepartment)
      }

      // Filter by specialization
      if (selectedSpecialization !== "all") {
        filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization)
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(doctor => 
          (doctor.name && doctor.name.toLowerCase().includes(query)) ||
          (doctor.departmentName && doctor.departmentName.toLowerCase().includes(query)) ||
          (doctor.specialization && doctor.specialization.toLowerCase().includes(query)) ||
          (doctor.email && doctor.email.toLowerCase().includes(query))
        )
      }

      return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } catch (error) {
      console.error('Error filtering doctors:', error)
      return []
    }
  }, [searchQuery, selectedDepartment, selectedSpecialization])

  const handleValueChange = (newValue: string) => {
    try {
      console.log('Doctor selected:', newValue)
      // Clear search and filters after selection for cleaner UI
      setSearchQuery("")
      setSelectedDepartment("all")
      setSelectedSpecialization("all")
      setShowFilters(false)
      onValueChange(newValue)
    } catch (error) {
      console.error('Error handling doctor selection:', error)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedDepartment("all")
    setSelectedSpecialization("all")
  }

  const activeFiltersCount = [
    searchQuery && "search",
    selectedDepartment !== "all" && "department", 
    selectedSpecialization !== "all" && "specialization"
  ].filter(Boolean).length

  return (
    <div className="space-y-3">
      <Label>Select Doctor *</Label>
      
      {/* Only show filters and search if no doctor is selected */}
      {!selectedDoctor && (
        <>
          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg bg-muted/30">
              {/* Department Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialization Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Specialization</Label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specializations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchQuery}"
                  <button 
                    onClick={clearSearch}
                    className="ml-1 hover:text-foreground"
                    title="Clear search filter"
                    aria-label="Clear search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedDepartment !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Dept: {mockDepartments.find(d => d.id === selectedDepartment)?.name || 'Unknown'}
                  <button 
                    onClick={() => setSelectedDepartment("all")}
                    className="ml-1 hover:text-foreground"
                    title="Clear department filter"
                    aria-label="Clear department filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSpecialization !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Spec: {selectedSpecialization}
                  <button 
                    onClick={() => setSelectedSpecialization("all")}
                    className="ml-1 hover:text-foreground"
                    title="Clear specialization filter"
                    aria-label="Clear specialization filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name, department, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Show search results count */}
          <div className="text-xs text-muted-foreground">
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
            {activeFiltersCount > 0 && (
              <span> (filtered from {mockDoctors.length} total)</span>
            )}
          </div>
        </>
      )}

      {/* Dropdown Select */}
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {filteredDoctors.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {activeFiltersCount > 0 ? "No doctors found matching current filters" : "No doctors available"}
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id} className="py-3">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{doctor.name || 'Unknown Doctor'}</span>
                    <Badge variant="outline" className="text-xs">
                      {doctor.departmentName || 'Unknown Dept'}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {doctor.specialization || 'Unknown Specialization'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {doctor.email || 'No email'}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {/* Selected doctor info - Clean and minimal */}
      {selectedDoctor && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-green-800">{selectedDoctor.name}</div>
              <div className="text-xs text-green-600">
                {selectedDoctor.departmentName || 'Unknown Department'} • {selectedDoctor.specialization || 'Unknown Specialization'}
              </div>
            </div>
            <Badge variant="default" className="text-xs bg-green-600">
              Selected
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onValueChange("")}
            className="mt-2 h-8 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            Change Doctor
          </Button>
        </div>
      )}
    </div>
  )
}