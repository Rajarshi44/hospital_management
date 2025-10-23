"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Doctor } from "@/lib/schedule-types"
import { mockDoctors } from "@/lib/schedule-mock-data"

interface DoctorSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  error?: string
}

export function DoctorSelector({ value, onValueChange, placeholder = "Choose a doctor", error }: DoctorSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedDoctor = mockDoctors.find(doctor => doctor.id === value)

  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return mockDoctors
    
    const query = searchQuery.toLowerCase()
    return mockDoctors.filter(doctor => 
      doctor.name.toLowerCase().includes(query) ||
      doctor.departmentName.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query) ||
      doctor.email.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const groupedDoctors = useMemo(() => {
    const grouped = filteredDoctors.reduce((acc, doctor) => {
      if (!acc[doctor.departmentName]) {
        acc[doctor.departmentName] = []
      }
      acc[doctor.departmentName].push(doctor)
      return acc
    }, {} as Record<string, Doctor[]>)

    // Sort departments alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((acc, dept) => {
        acc[dept] = grouped[dept].sort((a, b) => a.name.localeCompare(b.name))
        return acc
      }, {} as Record<string, Doctor[]>)
  }, [filteredDoctors])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSelect = (doctorId: string) => {
    onValueChange(doctorId)
    setOpen(false)
    setSearchQuery("")
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="space-y-2">
      <Label>Select Doctor *</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-10 px-3 py-2",
              !selectedDoctor && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            {selectedDoctor ? (
              <div className="flex items-center gap-3 flex-1 text-left">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(selectedDoctor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{selectedDoctor.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedDoctor.departmentName}
                    </Badge>
                    <span className="truncate">{selectedDoctor.specialization}</span>
                  </div>
                </div>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name, department, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-auto p-1"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          
          <ScrollArea className="max-h-[300px]">
            {Object.keys(groupedDoctors).length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No doctors found matching "{searchQuery}"
              </div>
            ) : (
              <div className="p-1">
                {Object.entries(groupedDoctors).map(([departmentName, doctors]) => (
                  <div key={departmentName} className="mb-2">
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50 rounded">
                      {departmentName} ({doctors.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {doctors.map((doctor) => (
                        <div
                          key={doctor.id}
                          onClick={() => handleSelect(doctor.id)}
                          className={cn(
                            "flex items-center gap-3 p-2 cursor-pointer rounded-sm hover:bg-accent",
                            value === doctor.id && "bg-accent"
                          )}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(doctor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{doctor.name}</span>
                              {value === doctor.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {doctor.specialization}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {doctor.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {selectedDoctor && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Selected Doctor:</div>
          <div className="mt-2 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {getInitials(selectedDoctor.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{selectedDoctor.name}</div>
              <div className="text-sm text-muted-foreground">{selectedDoctor.specialization}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {selectedDoctor.departmentName}
                </Badge>
                <span className="text-xs text-muted-foreground">{selectedDoctor.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}