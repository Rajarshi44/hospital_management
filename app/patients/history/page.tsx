"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-shell/app-layout"
import { mockPatients } from "@/lib/mockPatientHistory"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar, Activity, FileText } from "lucide-react"
import { format } from "date-fns"

export default function PatientHistoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const patients = Object.values(mockPatients)
  const filteredPatients = patients.filter(patient => 
    patient.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  )

  const handlePatientClick = (uhid: string) => {
    router.push(`/patients/history/${uhid}`)
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Patient History</h1>
          <p className="text-muted-foreground mt-2">View comprehensive patient medical history and records</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by UHID, name, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">No patients found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card 
                key={patient.uhid} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePatientClick(patient.uhid)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{patient.name}</h3>
                        <Badge variant="outline" className="font-mono">
                          {patient.uhid}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Demographics
                          </div>
                          <div className="font-medium mt-1">
                            {patient.age} yrs, {patient.gender}, {patient.bloodGroup}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Total Visits
                          </div>
                          <div className="font-medium mt-1">
                            {patient.stats.totalVisits} visits
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last Visit
                          </div>
                          <div className="font-medium mt-1">
                            {format(patient.stats.lastVisitDate, "PP")}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Active Meds
                          </div>
                          <div className="font-medium mt-1">
                            {patient.stats.activeMedications} medications
                          </div>
                        </div>
                      </div>

                      {patient.chronicConditions && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {patient.chronicConditions.split(',').map((condition, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {condition.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      View History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
