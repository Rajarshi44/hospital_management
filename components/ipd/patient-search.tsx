"use client"

import { useState, useMemo } from "react"
import { Search, User, Phone, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockOPDPatients } from "@/lib/ipd-mock-data"
import { Patient } from "@/lib/ipd-types"

interface PatientSearchProps {
  onPatientSelect: (patient: Patient | null) => void
  selectedPatient: Patient | null
}

export function PatientSearch({ onPatientSelect, selectedPatient }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return mockOPDPatients.slice(0, 5) // Show first 5 by default
    
    const query = searchQuery.toLowerCase()
    return mockOPDPatients.filter(patient => 
      patient.name.toLowerCase().includes(query) ||
      patient.uhid.toLowerCase().includes(query) ||
      patient.phone.includes(query) ||
      patient.email?.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patient-search">Search Patient</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="patient-search"
            placeholder="Search by name, UHID, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {selectedPatient && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">{selectedPatient.name}</h3>
                  <div className="text-sm text-green-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>UHID: {selectedPatient.uhid}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedPatient.age} years, {selectedPatient.gender}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                    {selectedPatient.bloodGroup && (
                      <Badge variant="secondary" className="text-xs">
                        Blood Group: {selectedPatient.bloodGroup}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onPatientSelect(null)}
                className="text-green-700 hover:text-green-800"
              >
                Change Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedPatient && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {searchQuery ? `Found ${filteredPatients.length} patient(s)` : 'Recent Patients'}
          </Label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredPatients.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground">
                <p>No patients found matching your search.</p>
              </Card>
            ) : (
              filteredPatients.map((patient) => (
                <Card 
                  key={patient.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onPatientSelect(patient)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{patient.name}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <span>UHID: {patient.uhid}</span>
                              <Badge variant="outline" className="text-xs">
                                {patient.age} years
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{patient.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {patient.bloodGroup && (
                          <Badge variant="secondary" className="text-xs">
                            {patient.bloodGroup}
                          </Badge>
                        )}
                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="text-xs text-orange-600">
                            Allergies: {patient.allergies.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}