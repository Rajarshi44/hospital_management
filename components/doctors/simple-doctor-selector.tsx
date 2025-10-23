"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Doctor } from "@/lib/schedule-types"
import { mockDoctors } from "@/lib/schedule-mock-data"

interface SimpleDoctorSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  error?: string
}

export function SimpleDoctorSelector({
  value,
  onValueChange,
  placeholder = "Choose a doctor",
  error,
}: SimpleDoctorSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedDoctor = mockDoctors.find(doctor => doctor.id === value)

  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return mockDoctors

    const query = searchQuery.toLowerCase()
    return mockDoctors.filter(
      doctor =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.departmentName.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const handleSelect = (doctor: Doctor) => {
    onValueChange(doctor.id)
    setOpen(false)
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
              "w-full justify-between",
              !selectedDoctor && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            {selectedDoctor ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedDoctor.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedDoctor.departmentName}
                </Badge>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredDoctors.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No doctors found.</div>
            ) : (
              filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  onClick={() => handleSelect(doctor)}
                  className={cn(
                    "flex items-center justify-between p-3 cursor-pointer rounded-sm hover:bg-accent",
                    value === doctor.id && "bg-accent"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{doctor.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {doctor.departmentName}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{doctor.specialization}</div>
                  </div>
                  {value === doctor.id && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedDoctor && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium">{selectedDoctor.name}</div>
          <div className="text-sm text-muted-foreground">
            {selectedDoctor.departmentName} • {selectedDoctor.specialization}
          </div>
        </div>
      )}
    </div>
  )
}
