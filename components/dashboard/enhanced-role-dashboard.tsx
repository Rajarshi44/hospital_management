"use client"

import React from "react"
import { useAuth } from "@/hooks/use-auth"
import { DraggableDashboard, DashboardWidget } from "./draggable-dashboard"
import {
  MetricCard,
  QuickActions,
  AppointmentQueue,
  TaskList,
  MiniChart,
  ActivityFeed,
} from "./enhanced-widgets"rt React from "react"
import { useAuth } from "@/hooks/use-auth"
import { DraggableDashboard, DashboardWidget } from "./draggable-dashboard"
import {
  MetricCard,
  QuickActions,
  Appoint            component: () => (
              <MiniChart
                title="Patient Distribution"
                data={(roleData as any).departmentData}
                type="pie"
                height={120}
              />
            ),e,
  TaskList,
  MiniChart,
  ActivityFeed,
} from "./enhanced-widgets"
import {
  Users,
  Calendar,
  Activity,
  DollarSign,
  Pill,
  TestTube,
  UserCheck,
  Building2,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  FileText,
  Phone,
  Stethoscope,
  Clipboard,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data generators for different roles
const generateMockData = (role: string) => {
  const mockData = {
    admin: {
      metrics: [
        { title: "Total Patients", value: "1,234", icon: Users, trend: { value: 12, isPositive: true } },
        { title: "Staff Members", value: "156", icon: Building2, description: "Across 8 departments" },
        { title: "Monthly Revenue", value: "$67,000", icon: DollarSign, trend: { value: 8, isPositive: true } },
        { title: "Bed Occupancy", value: "87%", icon: Activity, badge: { text: "High", variant: "destructive" as const } },
      ],
      chartData: [
        { name: "Jan", value: 45000 },
        { name: "Feb", value: 52000 },
        { name: "Mar", value: 48000 },
        { name: "Apr", value: 61000 },
        { name: "May", value: 55000 },
        { name: "Jun", value: 67000 },
      ],
      departmentData: [
        { name: "Emergency", value: 35 },
        { name: "Surgery", value: 28 },
        { name: "Cardiology", value: 20 },
        { name: "Pediatrics", value: 17 },
      ],
      activities: [
        { id: "1", title: "New staff hired", description: "Dr. Sarah Johnson joined Cardiology", time: "2 hours ago", type: "success" as const },
        { id: "2", title: "System maintenance", description: "Scheduled backup completed successfully", time: "4 hours ago", type: "info" as const },
        { id: "3", title: "Budget alert", description: "Q2 budget threshold reached", time: "6 hours ago", type: "warning" as const },
      ],
    },
    doctor: {
      metrics: [
        { title: "Today's Appointments", value: "12", icon: Calendar, badge: { text: "3 Pending", variant: "outline" as const } },
        { title: "My Patients", value: "45", icon: UserCheck, description: "Active under care" },
        { title: "Lab Results", value: "8", icon: TestTube, badge: { text: "Review Needed", variant: "destructive" as const } },
        { title: "Prescriptions", value: "23", icon: Pill, description: "Issued this week" },
      ],
      appointments: [
        { id: "1", patientName: "John Doe", time: "9:00 AM", status: "waiting" as const },
        { id: "2", patientName: "Sarah Smith", time: "9:30 AM", status: "in-progress" as const },
        { id: "3", patientName: "Mike Johnson", time: "10:00 AM", status: "completed" as const },
        { id: "4", patientName: "Emma Wilson", time: "10:30 AM", status: "waiting" as const },
      ],
      tasks: [
        { id: "1", title: "Review lab results for John Doe", priority: "high" as const, completed: false, dueTime: "30 min" },
        { id: "2", title: "Follow-up call with Sarah Smith", priority: "medium" as const, completed: false, dueTime: "1 hour" },
        { id: "3", title: "Update treatment plan", priority: "high" as const, completed: true },
        { id: "4", title: "Prescription renewal", priority: "low" as const, completed: false, dueTime: "2 hours" },
      ],
      chartData: [
        { name: "Mon", value: 8 },
        { name: "Tue", value: 12 },
        { name: "Wed", value: 15 },
        { name: "Thu", value: 10 },
        { name: "Fri", value: 14 },
      ],
    },
    nurse: {
      metrics: [
        { title: "Assigned Patients", value: "18", icon: UserCheck, description: "Current shift" },
        { title: "Medications Due", value: "12", icon: Pill, badge: { text: "Urgent", variant: "destructive" as const } },
        { title: "Vitals Recorded", value: "24", icon: Activity, description: "Today" },
        { title: "Tasks Completed", value: "15/20", icon: CheckCircle, description: "75% completion" },
      ],
      tasks: [
        { id: "1", title: "Administer medication - Room 204", priority: "high" as const, completed: false, dueTime: "15 min" },
        { id: "2", title: "Check vitals - Room 108", priority: "medium" as const, completed: false, dueTime: "45 min" },
        { id: "3", title: "Patient discharge prep", priority: "low" as const, completed: true },
        { id: "4", title: "IV line check - Room 302", priority: "high" as const, completed: false, dueTime: "30 min" },
      ],
      patients: [
        { id: "1", patientName: "Alice Brown", time: "Room 204", status: "waiting" as const },
        { id: "2", patientName: "Bob Wilson", time: "Room 108", status: "in-progress" as const },
        { id: "3", patientName: "Carol Davis", time: "Room 302", status: "completed" as const },
      ],
    },
    pharmacist: {
      metrics: [
        { title: "Pending Orders", value: "23", icon: Pill, badge: { text: "Urgent", variant: "destructive" as const } },
        { title: "Inventory Items", value: "1,456", icon: Building2, description: "In stock" },
        { title: "Low Stock Alert", value: "12", icon: AlertTriangle, badge: { text: "Action Needed", variant: "destructive" as const } },
        { title: "Dispensed Today", value: "89", icon: CheckCircle, description: "Medications" },
      ],
      stockData: [
        { name: "Antibiotics", value: 15 },
        { name: "Pain Relief", value: 8 },
        { name: "Diabetes", value: 22 },
        { name: "Heart", value: 12 },
      ],
      activities: [
        { id: "1", title: "Low stock alert", description: "Amoxicillin needs reordering", time: "1 hour ago", type: "warning" as const },
        { id: "2", title: "Order fulfilled", description: "Prescription #12345 completed", time: "2 hours ago", type: "success" as const },
      ],
    },
    patient: {
      metrics: [
        { title: "Next Appointment", value: "Tomorrow", icon: Calendar, description: "2:00 PM - Dr. Smith" },
        { title: "Prescriptions", value: "3", icon: Pill, description: "Active medications" },
        { title: "Lab Results", value: "2", icon: TestTube, description: "Pending review" },
        { title: "Health Score", value: "85/100", icon: Activity, badge: { text: "Good", variant: "secondary" as const } },
      ],
      appointments: [
        { id: "1", patientName: "Follow-up Visit", time: "Tomorrow 2:00 PM", status: "waiting" as const },
        { id: "2", patientName: "Lab Work", time: "Next Week", status: "waiting" as const },
      ],
      healthData: [
        { name: "Weight", value: 75 },
        { name: "BP Systolic", value: 120 },
        { name: "Heart Rate", value: 72 },
        { name: "Blood Sugar", value: 95 },
      ],
    },
  }

  return mockData[role as keyof typeof mockData] || mockData.patient
}

export function EnhancedRoleDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  if (!user) {
    return <div>Please log in to view your dashboard</div>
  }

  const roleData = generateMockData(user.role)
  
  // Generate widgets based on user role
  const generateWidgets = (): DashboardWidget[] => {
    const baseWidgets: DashboardWidget[] = []

    // Metrics widgets (always first)
    if ('metrics' in roleData) {
      roleData.metrics.forEach((metric, index) => {
        baseWidgets.push({
          id: `metric-${index}`,
          title: metric.title,
          type: "metric",
          size: "sm",
          priority: index,
          isVisible: true,
          component: () => (
            <MetricCard
              title={metric.title}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              trend={(metric as any).trend}
              badge={(metric as any).badge}
            />
          ),
        })
      })
    }

    // Role-specific widgets
    switch (user.role) {
      case "admin":
        baseWidgets.push(
          {
            id: "revenue-chart",
            title: "Revenue Trend",
            type: "chart",
            size: "md",
            priority: 10,
            isVisible: true,
            component: () => (
              <MiniChart
                title="Monthly Revenue"
                data={(roleData as any).chartData}
                type="line"
                height={120}
              />
            ),
          },
          {
            id: "department-chart",
            title: "Department Load",
            type: "chart",
            size: "md",
            priority: 11,
            isVisible: true,
            component: () => (
              <MiniChart
                title="Patient Distribution"
                data={(roleData as any).departmentData}
                type: "pie"
                height={120}
              />
            ),
          },
          {
            id: "activity-feed",
            title: "System Activity",
            type: "list",
            size: "md",
            priority: 12,
            isVisible: true,
            component: () => (
              <ActivityFeed activities={(roleData as any).activities} />
            ),
          }
        )
        break

      case "doctor":
        baseWidgets.push(
          {
            id: "appointment-queue",
            title: "Today's Patients",
            type: "list",
            size: "md",
            priority: 10,
            isVisible: true,
            component: () => (
              <AppointmentQueue appointments={(roleData as any).appointments} />
            ),
          },
          {
            id: "task-list",
            title: "Priority Tasks",
            type: "list",
            size: "md",
            priority: 11,
            isVisible: true,
            component: () => (
              <TaskList 
                tasks={(roleData as any).tasks}
                onTaskToggle={(taskId) => {
                  toast({
                    title: "Task Updated",
                    description: `Task ${taskId} status changed`,
                  })
                }}
              />
            ),
          },
          {
            id: "patient-chart",
            title: "Weekly Appointments",
            type: "chart",
            size: "md",
            priority: 12,
            isVisible: true,
            component: () => (
              <MiniChart
                title="This Week"
                data={(roleData as any).chartData}
                type: "bar"
                height={120}
              />
            ),
          }
        )
        break

      case "nurse":
        baseWidgets.push(
          {
            id: "patient-queue",
            title: "Assigned Patients",
            type: "list",
            size: "md",
            priority: 10,
            isVisible: true,
            component: () => (
              <AppointmentQueue appointments={(roleData as any).patients} />
            ),
          },
          {
            id: "nursing-tasks",
            title: "Today's Tasks",
            type: "list",
            size: "md",
            priority: 11,
            isVisible: true,
            component: () => (
              <TaskList 
                tasks={(roleData as any).tasks}
                onTaskToggle={(taskId) => {
                  toast({
                    title: "Task Completed",
                    description: "Task marked as completed",
                  })
                }}
              />
            ),
          }
        )
        break

      case "pharmacist":
        baseWidgets.push(
          {
            id: "stock-chart",
            title: "Inventory by Category",
            type: "chart",
            size: "md",
            priority: 10,
            isVisible: true,
            component: () => (
              <MiniChart
                title: "Stock Levels"
                data={(roleData as any).stockData}
                type: "bar"
                height={120}
              />
            ),
          },
          {
            id: "pharmacy-activity",
            title: "Recent Activity",
            type: "list",
            size: "md",
            priority: 11,
            isVisible: true,
            component: () => (
              <ActivityFeed activities={(roleData as any).activities} />
            ),
          }
        )
        break

      case "patient":
        baseWidgets.push(
          {
            id: "upcoming-appointments",
            title: "Upcoming Appointments",
            type: "list",
            size: "md",
            priority: 10,
            isVisible: true,
            component: () => (
              <AppointmentQueue appointments={(roleData as any).appointments} />
            ),
          },
          {
            id: "health-metrics",
            title: "Health Metrics",
            type: "chart",
            size: "md",
            priority: 11,
            isVisible: true,
            component: () => (
              <MiniChart
                title="Recent Vitals"
                data={(roleData as any).healthData}
                type: "bar"
                height={120}
              />
            ),
          }
        )
        break
    }

    // Quick Actions widget (common for all roles)
    const quickActions = [
      { id: "new-appointment", title: "New Appointment", icon: Calendar, onClick: () => toast({ title: "Opening appointment form..." }) },
      { id: "search", title: "Search", icon: Search, onClick: () => toast({ title: "Opening search..." }) },
      { id: "reports", title: "Reports", icon: FileText, onClick: () => toast({ title: "Opening reports..." }) },
      { id: "emergency", title: "Emergency", icon: Phone, onClick: () => toast({ title: "Emergency protocol activated", variant: "destructive" }), variant: "destructive" as const },
    ]

    baseWidgets.push({
      id: "quick-actions",
      title: "Quick Actions",
      type: "custom",
      size: "md",
      priority: 20,
      isVisible: true,
      component: () => <QuickActions actions={quickActions} />,
    })

    return baseWidgets
  }

  const widgets = generateWidgets()

  const handleWidgetOrderChange = (newWidgets: DashboardWidget[]) => {
    console.log("Widget order changed:", newWidgets)
  }

  const handleWidgetToggle = (widgetId: string, isVisible: boolean) => {
    toast({
      title: isVisible ? "Widget shown" : "Widget hidden",
      description: `Widget ${widgetId} has been ${isVisible ? "added to" : "removed from"} your dashboard`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's what's happening today.
        </p>
      </div>

      <DraggableDashboard
        widgets={widgets}
        onWidgetOrderChange={handleWidgetOrderChange}
        onWidgetToggle={handleWidgetToggle}
      />
    </div>
  )
}