"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { LabOrderStatus } from "@/lib/types/lab.types"
import { labService } from "@/lib/services/lab.service"

interface LabOrderStatusDialogProps {
  orderId: string
  currentStatus: LabOrderStatus
  onStatusUpdate: (orderId: string, newStatus: LabOrderStatus) => void
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: LabOrderStatus.PENDING, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: LabOrderStatus.IN_PROGRESS, label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: LabOrderStatus.COMPLETED, label: "Completed", color: "bg-green-100 text-green-800" },
  { value: LabOrderStatus.CANCELLED, label: "Cancelled", color: "bg-red-100 text-red-800" },
] as const

export function LabOrderStatusDialog({
  orderId,
  currentStatus,
  onStatusUpdate,
  onClose,
}: LabOrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (selectedStatus === currentStatus) {
      onClose()
      return
    }

    setIsUpdating(true)
    try {
      await labService.updateOrderStatus(orderId, {
        status: selectedStatus,
        notes: `Status changed from ${currentStatus} to ${selectedStatus}`,
      })
      
      onStatusUpdate(orderId, selectedStatus)
      toast({
        title: "Status Updated",
        description: `Order status changed to ${STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}`,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of lab order #{orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <Badge className={STATUS_OPTIONS.find(s => s.value === currentStatus)?.color}>
              {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={(value: LabOrderStatus) => setSelectedStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
