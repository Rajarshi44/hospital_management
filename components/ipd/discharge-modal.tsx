"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IPDService } from "@/lib/ipd-service"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, User, Bed, DollarSign } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface DischargeModalProps {
  patient: any
  isOpen: boolean
  onClose: () => void
  onDischarge: () => void
}

export function DischargeModal({ patient, isOpen, onClose, onDischarge }: DischargeModalProps) {
  const [dischargeDate, setDischargeDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dischargeTime, setDischargeTime] = useState(format(new Date(), 'HH:mm'))
  const [dischargeSummary, setDischargeSummary] = useState("")
  const [finalDiagnosis, setFinalDiagnosis] = useState("")
  const [medications, setMedications] = useState("")
  const [followUpInstructions, setFollowUpInstructions] = useState("")
  const [discharging, setDischarging] = useState(false)
  const { toast } = useToast()

  const calculateStayDuration = () => {
    if (!patient) return 0
    return differenceInDays(new Date(), new Date(patient.admissionDate))
  }

  const calculateEstimatedCost = () => {
    const days = calculateStayDuration()
    const dailyRate = patient?.bed?.dailyRate || 0
    return days * dailyRate
  }

  const handleDischarge = async () => {
    if (!patient || !dischargeSummary || !finalDiagnosis) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setDischarging(true)
      
      await IPDService.createDischarge({
        admissionId: patient.id,
        doctorId: patient.doctor.id,
        dischargeDate: `${dischargeDate}T${dischargeTime}:00.000Z`,
        finalDiagnosis,
        treatmentSummary: dischargeSummary,
        followUpInstructions: followUpInstructions || undefined,
        notes: medications || undefined,
      })

      toast({
        title: "Success",
        description: "Patient discharged successfully",
      })

      onDischarge()
      onClose()
      
      // Reset form
      setDischargeSummary("")
      setFinalDiagnosis("")
      setMedications("")
      setFollowUpInstructions("")
    } catch (error) {
      console.error('Error discharging patient:', error)
      toast({
        title: "Error",
        description: "Failed to discharge patient",
        variant: "destructive",
      })
    } finally {
      setDischarging(false)
    }
  }

  if (!patient) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Discharge</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Summary */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {patient.patient.firstName} {patient.patient.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">#{patient.admissionId}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Ready for Discharge
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Admitted</p>
                  <p className="font-medium">{format(new Date(patient.admissionDate), 'dd MMM yyyy')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{calculateStayDuration()} days</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Ward/Bed</p>
                  <p className="font-medium">{patient.bed.ward.name} - {patient.bed.bedNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Est. Cost</p>
                  <p className="font-medium">₹{calculateEstimatedCost().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Discharge Details Form */}
          <div className="space-y-4">
            <h4 className="font-semibold">Discharge Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dischargeDate">Discharge Date *</Label>
                <Input
                  id="dischargeDate"
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dischargeTime">Discharge Time *</Label>
                <Input
                  id="dischargeTime"
                  type="time"
                  value={dischargeTime}
                  onChange={(e) => setDischargeTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalDiagnosis">Final Diagnosis *</Label>
              <Input
                id="finalDiagnosis"
                placeholder="Enter final diagnosis"
                value={finalDiagnosis}
                onChange={(e) => setFinalDiagnosis(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dischargeSummary">Discharge Summary *</Label>
              <Textarea
                id="dischargeSummary"
                placeholder="Enter discharge summary including treatment provided, patient condition, and recommendations..."
                value={dischargeSummary}
                onChange={(e) => setDischargeSummary(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Discharge Medications</Label>
              <Textarea
                id="medications"
                placeholder="List medications with dosage and instructions..."
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUp">Follow-up Instructions</Label>
              <Textarea
                id="followUp"
                placeholder="Follow-up appointments, restrictions, care instructions..."
                value={followUpInstructions}
                onChange={(e) => setFollowUpInstructions(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={discharging}>
              Cancel
            </Button>
            <Button 
              onClick={handleDischarge} 
              disabled={!dischargeSummary || !finalDiagnosis || discharging}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {discharging ? "Processing Discharge..." : "Discharge Patient"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}