"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Search, Clock, CheckCircle, AlertCircle, User, Pill, Package } from "lucide-react"
import { mockPrescriptions, getPrescriptionsByStatus, type Prescription } from "@/lib/pharmacy"
import { format } from "date-fns"

export function PrescriptionManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)

  const pendingPrescriptions = getPrescriptionsByStatus("pending")
  const readyPrescriptions = getPrescriptionsByStatus("ready")
  const filledPrescriptions = getPrescriptionsByStatus("filled")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "filled":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "dispensed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "text-red-600"
      case "urgent":
        return "text-orange-600"
      case "routine":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "ready":
        return <Package className="h-4 w-4" />
      case "filled":
        return <CheckCircle className="h-4 w-4" />
      case "dispensed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleFillPrescription = (prescription: Prescription) => {
    // In a real app, this would update the backend
    console.log("Filling prescription:", prescription.id)
  }

  const handleDispensePrescription = (prescription: Prescription) => {
    // In a real app, this would update the backend
    console.log("Dispensing prescription:", prescription.id)
  }

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => setSelectedPrescription(prescription)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {prescription.patientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{prescription.patientName}</h4>
                <Badge className={getStatusColor(prescription.status)} variant="secondary">
                  {getStatusIcon(prescription.status)}
                  <span className="ml-1">{prescription.status}</span>
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>{prescription.medication.name}</strong> {prescription.dosage}
                </p>
                <p>
                  {prescription.frequency} • {prescription.duration}
                </p>
                <p>Prescribed by {prescription.doctorName}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Qty: {prescription.quantity}</span>
                <span>
                  Refills: {prescription.refills - prescription.refillsUsed}/{prescription.refills}
                </span>
                <span className={getPriorityColor(prescription.priority)}>{prescription.priority.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="text-right text-sm text-muted-foreground">
            <div>{format(prescription.prescribedDate, "MMM d")}</div>
            <div>{format(prescription.prescribedDate, "h:mm a")}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingPrescriptions.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyPrescriptions.length}</div>
            <p className="text-xs text-muted-foreground">Ready for pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filled Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{filledPrescriptions.length}</div>
            <p className="text-xs text-muted-foreground">Completed prescriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search prescriptions by patient name, medication, or prescription ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Prescription Lists */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="ready">Ready ({readyPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="filled">Filled ({filledPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="all">All Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending prescriptions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingPrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          {readyPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No prescriptions ready for pickup</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {readyPrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="filled" className="space-y-4">
          {filledPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No prescriptions filled today</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filledPrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {mockPrescriptions.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Prescription Details</CardTitle>
                <CardDescription>Prescription ID: {selectedPrescription.id}</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setSelectedPrescription(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {selectedPrescription.patientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedPrescription.patientName}</p>
                    <p className="text-sm text-muted-foreground">ID: {selectedPrescription.patientId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Prescribing Doctor
                </h4>
                <div>
                  <p className="font-medium">{selectedPrescription.doctorName}</p>
                  <p className="text-sm text-muted-foreground">ID: {selectedPrescription.doctorId}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Medication Details */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medication Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medication</label>
                  <p className="font-medium">{selectedPrescription.medication.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPrescription.medication.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dosage</label>
                  <p>{selectedPrescription.dosage}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Frequency</label>
                  <p>{selectedPrescription.frequency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p>{selectedPrescription.duration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                  <p>{selectedPrescription.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Refills</label>
                  <p>
                    {selectedPrescription.refills - selectedPrescription.refillsUsed} of {selectedPrescription.refills}{" "}
                    remaining
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Instructions & Notes */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Instructions</label>
                <p className="mt-1 p-3 bg-muted rounded-md text-sm">{selectedPrescription.instructions}</p>
              </div>
              {selectedPrescription.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-md text-sm">{selectedPrescription.notes}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Status & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(selectedPrescription.status)}>
                  {getStatusIcon(selectedPrescription.status)}
                  <span className="ml-1">{selectedPrescription.status}</span>
                </Badge>
                <Badge variant="outline" className={getPriorityColor(selectedPrescription.priority)}>
                  {selectedPrescription.priority.toUpperCase()}
                </Badge>
              </div>

              <div className="flex gap-2">
                {selectedPrescription.status === "pending" && (
                  <Button onClick={() => handleFillPrescription(selectedPrescription)}>Fill Prescription</Button>
                )}
                {selectedPrescription.status === "ready" && (
                  <Button onClick={() => handleDispensePrescription(selectedPrescription)}>Dispense</Button>
                )}
                <Button variant="outline">Print Label</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
