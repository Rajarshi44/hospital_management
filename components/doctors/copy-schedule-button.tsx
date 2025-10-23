"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { Schedule } from "@/lib/schedule-types"

interface CopyScheduleButtonProps {
  schedules: Schedule[]
  onCopySchedules: (newSchedules: Schedule[]) => void
}

export function CopyScheduleButton({ schedules, onCopySchedules }: CopyScheduleButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyLastWeek = () => {
    // Get current date
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Filter active schedules that would have been active last week
    const schedulesToCopy = schedules.filter(schedule => {
      if (schedule.status !== "active") return false

      const validFrom = new Date(schedule.validFrom)
      const validTo = schedule.validTo === "always" ? new Date("2999-12-31") : new Date(schedule.validTo)

      return validFrom <= lastWeek && validTo >= lastWeek
    })

    if (schedulesToCopy.length === 0) {
      return
    }

    // Create new schedules for current week
    const newSchedules: Schedule[] = schedulesToCopy.map(schedule => ({
      ...schedule,
      id: `${schedule.id}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      validFrom: today.toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }))

    onCopySchedules(newSchedules)
    setIsCopied(true)

    setTimeout(() => setIsCopied(false), 2000)
  }

  const activeSchedulesCount = schedules.filter(s => s.status === "active").length

  return (
    <Button
      variant="outline"
      onClick={handleCopyLastWeek}
      disabled={activeSchedulesCount === 0 || isCopied}
      className="flex items-center gap-2"
    >
      {isCopied ? (
        <>
          <Check className="h-4 w-4" />
          Schedules Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy Last Week
        </>
      )}
    </Button>
  )
}
