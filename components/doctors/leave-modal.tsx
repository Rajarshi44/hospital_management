"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, X } from "lucide-react"

interface LeaveModalProps {
  doctorName: string
  onSave: (date: string, note: string) => void
  onCancel: () => void
}

export function LeaveModal({ doctorName, onSave, onCancel }: LeaveModalProps) {
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  const handleSave = () => {
    if (!date) return
    onSave(date, note)
    setDate('')
    setNote('')
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mark Leave / Holiday
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Doctor:</p>
            <p className="font-medium">{doctorName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-date">Date</Label>
            <Input
              id="leave-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-note">Note (optional)</Label>
            <Textarea
              id="leave-note"
              placeholder="e.g., Medical conference, Personal leave, Holiday"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!date}>
              Mark Leave
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}