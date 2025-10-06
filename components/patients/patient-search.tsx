"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Phone, Mail, Calendar, Loader2 } from "lucide-react"
import { PatientService, type Patient } from "@/lib/patient-service"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void
  onNewPatient: () => void
  refreshTrigger?: number
}

export function PatientSearch({ onPatientSelect, onNewPatient, refreshTrigger }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()
  const patientService = PatientService.getInstance()

  // Load all patients on mount and when refresh is triggered
  useEffect(() => {
    loadPatients()
  }, [refreshTrigger])

  const loadPatients = async () => {
    setIsLoading(true)
    try {
      const patients = await patientService.getAllPatients()
      setAllPatients(patients)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load patients",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)

    // Perform search with slight delay for better UX
    setTimeout(() => {
      const results = patientService.searchPatients(allPatients, query)
      setSearchResults(results)
      setIsSearching(false)
    }, 300)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, email, phone, or ID..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button onClick={onNewPatient}>
          <Plus className="h-4 w-4 mr-2" />
          New Patient
        </Button>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {isSearching ? "Searching..." : `${searchResults.length} patient(s) found`}
            </h3>
          </div>

          {!isSearching && searchResults.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No patients found matching your search.</p>
                <Button onClick={onNewPatient} className="mt-4">
                  Add New Patient
                </Button>
              </CardContent>
            </Card>
          )}

          {searchResults.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onPatientSelect(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {patientService.getFullName(patient)}
                        </h4>
                        <Badge className={getStatusColor(patient.isActive)}>
                          {patient.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Age {patientService.calculateAge(patient.dateOfBirth)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{patient.email}</span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span>ID: {patient.id}</span>
                        <span className="ml-4">
                          Registered: {format(new Date(patient.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Gender:</span> {patient.gender}
                        {patient.bloodGroup && (
                          <span className="ml-4">
                            <span className="font-medium">Blood:</span> {patient.bloodGroup}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <div>{patient.city}, {patient.state}</div>
                    <div>{patient.zipCode}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Default view when no search */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Management</CardTitle>
            <CardDescription>Search for existing patients or add a new patient to the system.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Start typing to search for patients</p>
            <Button onClick={onNewPatient}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Patient
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
