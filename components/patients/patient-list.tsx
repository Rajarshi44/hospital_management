"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PatientService, type Patient } from "@/lib/patient-service"
import { Eye, Loader2, Search, UserPlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PatientListProps {
  onPatientSelect: (patient: Patient) => void
  onNewPatient?: () => void
  refreshTrigger?: number
}

export function PatientList({ onPatientSelect, onNewPatient, refreshTrigger }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const patientService = PatientService.getInstance()

  useEffect(() => {
    loadPatients()
  }, [refreshTrigger])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = patientService.searchPatients(patients, searchQuery)
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchQuery, patients])

  const loadPatients = async () => {
    setIsLoading(true)
    setError("")
    try {
      const data = await patientService.getAllPatients()
      setPatients(data)
      setFilteredPatients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getGenderBadge = (gender: string) => {
    const variants = {
      MALE: "default",
      FEMALE: "secondary",
      OTHER: "outline",
    } as const
    return <Badge variant={variants[gender as keyof typeof variants] || "outline"}>{gender}</Badge>
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No patients found matching your search." : "No patients in the system yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        {patient.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {patientService.getFullName(patient)}
                      </TableCell>
                      <TableCell>{getGenderBadge(patient.gender)}</TableCell>
                      <TableCell>{patientService.calculateAge(patient.dateOfBirth)} yrs</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                      <TableCell>{getStatusBadge(patient.isActive)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(patient.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPatientSelect(patient)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
