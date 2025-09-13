"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Check, AlertTriangle, Info, CheckCircle, X, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
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
  relatedId?: string
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all")
  const { user } = useAuth()
  const { toast } = useToast()

  // Mock notifications based on user role
  useEffect(() => {
    const generateNotifications = (): Notification[] => {
      const baseNotifications: Notification[] = [
        {
          id: "1",
          title: "System Maintenance",
          message: "Scheduled maintenance tonight from 2:00 AM - 4:00 AM",
          type: "info",
          priority: "medium",
          category: "System",
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
        },
        {
          id: "2",
          title: "New Message",
          message: "You have a new message from Dr. Smith",
          type: "info",
          priority: "low",
          category: "Communication",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
        },
      ]

      if (!user) return baseNotifications

      const roleSpecificNotifications: Record<string, Notification[]> = {
        doctor: [
          {
            id: "3",
            title: "Lab Results Available",
            message: "Lab results for John Smith are ready for review",
            type: "success",
            priority: "high",
            category: "Lab Results",
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            read: false,
            actionUrl: "/lab",
            actionLabel: "View Results",
          },
          {
            id: "4",
            title: "Urgent Consultation",
            message: "Emergency patient requires immediate attention in Room 302",
            type: "error",
            priority: "urgent",
            category: "Emergency",
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            read: false,
            actionUrl: "/patients",
            actionLabel: "View Patient",
          },
        ],
        nurse: [
          {
            id: "5",
            title: "Medication Due",
            message: "Patient in Room 205 is due for medication at 3:00 PM",
            type: "warning",
            priority: "high",
            category: "Medication",
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            read: false,
          },
          {
            id: "6",
            title: "Shift Change",
            message: "Your shift ends in 30 minutes. Please complete handover notes",
            type: "info",
            priority: "medium",
            category: "Schedule",
            timestamp: new Date(Date.now() - 25 * 60 * 1000),
            read: false,
          },
        ],
        receptionist: [
          {
            id: "7",
            title: "Appointment Reminder",
            message: "Send reminder to Emily Davis for tomorrow's 10:00 AM appointment",
            type: "info",
            priority: "medium",
            category: "Appointments",
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            read: false,
          },
        ],
        pharmacist: [
          {
            id: "8",
            title: "Low Stock Alert",
            message: "Amoxicillin is running low (5 units remaining)",
            type: "warning",
            priority: "high",
            category: "Inventory",
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
            read: false,
            actionUrl: "/pharmacy",
            actionLabel: "Reorder",
          },
        ],
        admin: [
          {
            id: "9",
            title: "Monthly Report Ready",
            message: "January financial report is ready for review",
            type: "success",
            priority: "medium",
            category: "Reports",
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            read: false,
            actionUrl: "/billing",
            actionLabel: "View Report",
          },
        ],
      }

      return [...baseNotifications, ...(roleSpecificNotifications[user.role] || [])]
    }

    setNotifications(generateNotifications())
  }, [user])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200"
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "medium":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    toast({
      title: "All notifications marked as read",
      description: "Your notification center has been cleared",
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.read
      case "urgent":
        return notification.priority === "urgent" || notification.priority === "high"
      default:
        return true
    }
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const urgentCount = notifications.filter((n) => n.priority === "urgent").length

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-transparent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
          </SheetTitle>
          <SheetDescription>Stay updated with important alerts and messages</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="urgent">Urgent ({urgentCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          <Separator />

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread" ? "All caught up!" : "You're all set"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors ${!notification.read ? "bg-muted/50" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getTypeIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                                  {notification.priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{notification.category}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(notification.timestamp)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {notification.actionUrl && (
                            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                              {notification.actionLabel || "View"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
