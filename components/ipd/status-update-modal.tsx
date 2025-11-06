"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { IPDService } from "@/lib/ipd-service"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Check, Activity, Clock } from "lucide-react"

interface StatusUpdateModalProps {
  patient: any
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: () => void
}

const statusOptions = [
  { value: 'STABLE', label: 'Stable', icon: Check, color: 'bg-green-100 text-green-800' },
  { value: 'CRITICAL', label: 'Critical', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
  { value: 'RECOVERY', label: 'Recovery', icon: Activity, color: 'bg-blue-100 text-blue-800' },
]

export function StatusUpdateModal({ patient, isOpen, onClose, onStatusUpdate }: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !patient) return

    try {
      setUpdating(true)
      await IPDService.updateAdmission(patient.id, {
        status: selectedStatus,
        notes: notes || undefined
      })

      toast({
        title: "Success",
        description: "Patient status updated successfully",
      })

      onStatusUpdate()
      onClose()
      setSelectedStatus("")
      setNotes("")
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error", 
        description: "Failed to update patient status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (!patient) return null

  const currentStatusOption = statusOptions.find(opt => opt.value === patient.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Patient Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">{patient.patient.firstName} {patient.patient.lastName}</h3>
            <p className="text-sm text-muted-foreground">#{patient.admissionId}</p>
            <div className="mt-2">
              <Badge className={currentStatusOption?.color || 'bg-gray-100 text-gray-800'}>
                Current: {patient.status}
              </Badge>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any notes about the status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={updating}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={!selectedStatus || updating}
              className="flex-1"
            >
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}