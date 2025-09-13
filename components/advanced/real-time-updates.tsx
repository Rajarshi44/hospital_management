"use client"

import { useEffect, useState } from "react"
import { Bell, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

interface RealTimeUpdate {
  id: string
  type: "appointment" | "patient" | "lab" | "prescription" | "system"
  title: string
  message: string
  timestamp: Date
  priority: "low" | "medium" | "high" | "critical"
  read: boolean
}

interface RealTimeUpdatesProps {
  onUpdate?: (update: RealTimeUpdate) => void
}

export function RealTimeUpdates({ onUpdate }: RealTimeUpdatesProps) {
  const [isConnected, setIsConnected] = useState(true)
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Simulate real-time connection
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate connection status changes
      const shouldDisconnect = Math.random() < 0.05 // 5% chance of disconnection
      if (shouldDisconnect && isConnected) {
        setIsConnected(false)
        toast({
          title: "Connection Lost",
          description: "Real-time updates are temporarily unavailable",
          variant: "destructive",
        })
      } else if (!shouldDisconnect && !isConnected) {
        setIsConnected(true)
        toast({
          title: "Connection Restored",
          description: "Real-time updates are now available",
        })
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [isConnected])

  // Simulate incoming updates
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      const shouldReceiveUpdate = Math.random() < 0.3 // 30% chance of update
      if (shouldReceiveUpdate) {
        const updateTypes = ["appointment", "patient", "lab", "prescription", "system"] as const
        const priorities = ["low", "medium", "high", "critical"] as const

        const mockUpdates = [
          {
            type: "appointment" as const,
            title: "New Appointment Scheduled",
            message: "Dr. Smith has a new appointment at 3:00 PM",
          },
          {
            type: "patient" as const,
            title: "Patient Check-in",
            message: "John Doe has checked in for his appointment",
          },
          {
            type: "lab" as const,
            title: "Lab Results Ready",
            message: "Blood test results are available for review",
          },
          {
            type: "prescription" as const,
            title: "Prescription Filled",
            message: "Medication ready for pickup at pharmacy",
          },
          {
            type: "system" as const,
            title: "System Maintenance",
            message: "Scheduled maintenance will begin at midnight",
          },
        ]

        const randomUpdate = mockUpdates[Math.floor(Math.random() * mockUpdates.length)]
        const newUpdate: RealTimeUpdate = {
          id: Math.random().toString(36).substr(2, 9),
          type: randomUpdate.type,
          title: randomUpdate.title,
          message: randomUpdate.message,
          timestamp: new Date(),
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          read: false,
        }

        setUpdates((prev) => [newUpdate, ...prev.slice(0, 9)]) // Keep last 10 updates
        setUnreadCount((prev) => prev + 1)
        onUpdate?.(newUpdate)

        // Show toast for high priority updates
        if (newUpdate.priority === "high" || newUpdate.priority === "critical") {
          toast({
            title: newUpdate.title,
            description: newUpdate.message,
            variant: newUpdate.priority === "critical" ? "destructive" : "default",
          })
        }
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [isConnected, onUpdate])

  const markAllAsRead = () => {
    setUpdates((prev) => prev.map((update) => ({ ...update, read: true })))
    setUnreadCount(0)
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      appointment: "📅",
      patient: "👤",
      lab: "🧪",
      prescription: "💊",
      system: "⚙️",
    }
    return icons[type as keyof typeof icons] || "📢"
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Real-time Updates
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {updates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent updates</p>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className={`p-3 rounded-lg border ${update.read ? "bg-muted/50" : "bg-background border-primary/20"}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{getTypeIcon(update.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{update.title}</p>
                    <Badge variant="secondary" className={`text-xs ${getPriorityColor(update.priority)}`}>
                      {update.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{update.message}</p>
                  <p className="text-xs text-muted-foreground">{update.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
