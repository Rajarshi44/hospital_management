"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])

      // Show toast for high priority notifications
      if (notification.priority === "urgent" || notification.priority === "high") {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === "error" ? "destructive" : "default",
        })
      }

      return newNotification.id
    },
    [toast],
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const urgentCount = notifications.filter((n) => n.priority === "urgent").length

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add notifications for demo purposes
      if (Math.random() < 0.1) {
        // 10% chance every 30 seconds
        const sampleNotifications = [
          {
            title: "New Lab Result",
            message: "Lab results are available for review",
            type: "success" as const,
            priority: "medium" as const,
            category: "Lab Results",
          },
          {
            title: "Appointment Reminder",
            message: "Patient appointment in 15 minutes",
            type: "info" as const,
            priority: "high" as const,
            category: "Appointments",
          },
          {
            title: "Low Stock Alert",
            message: "Medication inventory is running low",
            type: "warning" as const,
            priority: "medium" as const,
            category: "Inventory",
          },
        ]

        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)]
        addNotification(randomNotification)
      }
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [addNotification])

  return {
    notifications,
    unreadCount,
    urgentCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  }
}
