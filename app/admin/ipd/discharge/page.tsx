"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Download, UserCheck, Clock, AlertTriangle, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockAdmissions, getDaysAdmitted } from "@/lib/ipd-mock-data"
import { DischargeForm } from "@/components/ipd"
import { AppLayout } from "@/components/app-shell/app-layout"
import { AuthProvider } from "@/hooks/use-auth"

export default function DischargePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAdmission, setSelectedAdmission] = useState<string | null>(null)

  // Filter admissions that can be discharged (not already discharged)
  const dischargeableAdmissions = mockAdmissions.filter(admission => admission.status !== "discharged")

  const filteredAdmissions = dischargeableAdmissions.filter(admission => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    return (
      admission.patientName.toLowerCase().includes(query) ||
      admission.admissionId.toLowerCase().includes(query) ||
      admission.uhid.toLowerCase().includes(query)
    )
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive"
      case "stable":
        return "default"
      case "observation":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-3 w-3" />
      case "stable":
        return <UserCheck className="h-3 w-3" />
      case "observation":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  const calculateEstimatedCharges = (admission: any) => {
    const days = getDaysAdmitted(admission.admissionDate)
    const bedCharges =
      days *
      (admission.bedId === "21" || admission.bedId === "22" || admission.bedId === "23"
        ? 1200
        : admission.bedId === "11" || admission.bedId === "12" || admission.bedId === "13"
          ? 500
          : 150)
    const medicalCharges = Math.floor(Math.random() * 2000) + 500 // Simulated medical charges
    const totalCharges = bedCharges + medicalCharges + (admission.initialDeposit || 0)
    return { days, bedCharges, medicalCharges, totalCharges }
  }

  return (
    <AuthProvider>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Patient Discharge</h1>
              <p className="text-muted-foreground">Process patient discharges and generate discharge summaries</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => router.push("/admin/ipd")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Discharge Reports
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready for Discharge</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dischargeableAdmissions.filter(a => a.status === "stable").length}
                </div>
                <p className="text-xs text-muted-foreground">Stable patients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Discharges</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Completed today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Stay Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-muted-foreground">Days per patient</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Admitted Patients
              </CardTitle>
              <CardDescription>Find patients ready for discharge by name, admission ID, or UHID</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, admission ID, or UHID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admitted Patients ({filteredAdmissions.length})
              </CardTitle>
              <CardDescription>Select a patient to initiate discharge process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Patient Info</TableHead>
                      <TableHead>Admission Details</TableHead>
                      <TableHead>Current Status</TableHead>
                      <TableHead>Stay Duration</TableHead>
                      <TableHead>Est. Charges</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmissions.map(admission => {
                      const charges = calculateEstimatedCharges(admission)
                      return (
                        <TableRow key={admission.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{admission.patientName}</div>
                              <div className="text-sm text-muted-foreground">
                                {admission.admissionId} • {admission.uhid}
                              </div>
                              <div className="text-xs text-muted-foreground">Dr. {admission.consultingDoctorName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{admission.wardName}</div>
                              <Badge variant="outline" className="text-xs">
                                Bed {admission.bedNumber}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                Admitted: {new Date(admission.admissionDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge
                                variant={getStatusBadgeColor(admission.status)}
                                className="flex items-center gap-1 w-fit"
                              >
                                {getStatusIcon(admission.status)}
                                {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                              </Badge>
                              <div className="text-xs text-muted-foreground">{admission.tentativeDiagnosis}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{charges.days} days</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">${charges.totalCharges.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                Bed: ${charges.bedCharges} • Medical: ${charges.medicalCharges}
                              </div>
                              {admission.initialDeposit && (
                                <div className="text-xs text-green-600">Deposit: ${admission.initialDeposit}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    disabled={admission.status === "critical"}
                                    className="min-w-[100px]"
                                  >
                                    {admission.status === "critical" ? "Not Ready" : "Discharge"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Discharge Patient</DialogTitle>
                                    <DialogDescription>
                                      Complete discharge process for {admission.patientName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DischargeForm admission={admission} estimatedCharges={charges} />
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredAdmissions.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-sm font-semibold">No patients found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search criteria."
                      : "No patients are currently admitted or ready for discharge."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthProvider>
  )
}
