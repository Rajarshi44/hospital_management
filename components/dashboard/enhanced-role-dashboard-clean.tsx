"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DraggableDashboard, DashboardWidget } from "./draggable-dashboard"
import { MetricCard, QuickActions, AppointmentQueue, TaskList, MiniChart, ActivityFeed } from "./enhanced-widgets"
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
import { PatientService, type Patient } from "@/lib/patient-service"

// Mock data for different roles (updated with real patient data)
const getMockData = (stats: any) => ({
  admin: {
    metrics: [
      { title: "Total Patients", value: stats.totalPatients.toString(), icon: Users, trend: { value: stats.recentPatients, isPositive: true }, description: `${stats.recentPatients} new this month` },
      { title: "Active Patients", value: stats.activePatients.toString(), icon: UserCheck, description: `${stats.malePatients} male, ${stats.femalePatients} female` },
      { title: "Average Age", value: `${stats.averageAge} yrs`, icon: Activity, description: "Patient demographics" },
      {
        title: "Patient Growth",
        value: `+${stats.recentPatients}`,
        icon: Building2,
        badge: { text: "Last 30 days", variant: "outline" as const },
      },
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
  },
  doctor: {
    metrics: [
      {
        title: "Today's Appointments",
        value: "12",
        icon: Calendar,
        badge: { text: "3 Pending", variant: "outline" as const },
      },
      { title: "My Patients", value: "45", icon: UserCheck, description: "Active under care" },
      {
        title: "Lab Results",
        value: "8",
        icon: TestTube,
        badge: { text: "Review Needed", variant: "destructive" as const },
      },
      { title: "Prescriptions", value: "23", icon: Pill, description: "Issued this week" },
    ],
    appointments: [
      { id: "1", patientName: "John Doe", time: "9:00 AM", status: "waiting" as const },
      { id: "2", patientName: "Sarah Smith", time: "9:30 AM", status: "in-progress" as const },
      { id: "3", patientName: "Mike Johnson", time: "10:00 AM", status: "completed" as const },
    ],
    tasks: [
      {
        id: "1",
        title: "Review lab results for John Doe",
        priority: "high" as const,
        completed: false,
        dueTime: "30 min",
      },
      {
        id: "2",
        title: "Follow-up call with Sarah Smith",
        priority: "medium" as const,
        completed: false,
        dueTime: "1 hour",
      },
    ],
  },
})

export function EnhancedRoleDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const patientService = PatientService.getInstance()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const data = await patientService.getAllPatients()
      setPatients(data)
    } catch (error) {
      console.error("Failed to load patients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate real statistics from patient data
  const getPatientStats = () => {
    const totalPatients = patients.length
    const activePatients = patients.filter(p => p.isActive).length
    const malePatients = patients.filter(p => p.gender === 'MALE').length
    const femalePatients = patients.filter(p => p.gender === 'FEMALE').length
    const recentPatients = patients.filter(p => {
      const createdDate = new Date(p.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return createdDate >= thirtyDaysAgo
    }).length

    // Get age distribution
    const averageAge = patients.length > 0 
      ? Math.round(patients.reduce((sum, p) => sum + patientService.calculateAge(p.dateOfBirth), 0) / patients.length)
      : 0

    return {
      totalPatients,
      activePatients,
      malePatients,
      femalePatients,
      recentPatients,
      averageAge
    }
  }

  const stats = getPatientStats()

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium">Please log in to view your dashboard</div>
          <p className="text-muted-foreground">You need to be authenticated to access the dashboard</p>
        </div>
      </div>
    )
  }

  // Ensure we have a valid role, fallback to 'doctor' if needed
  const mockData = getMockData(stats)
  const userRole = user.role && user.role.toLowerCase() in mockData ? user.role.toLowerCase() : "doctor"
  const roleData = mockData[userRole as keyof typeof mockData]

  // Generate widgets based on user role
  const generateWidgets = (): DashboardWidget[] => {
    const dashboardWidgets: DashboardWidget[] = []

    try {
      // Add metric widgets
      if (roleData && "metrics" in roleData && Array.isArray(roleData.metrics)) {
        roleData.metrics.forEach((metric, index) => {
          dashboardWidgets.push({
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

      // Add chart widgets
      if (roleData && "chart" in roleData && roleData.chart) {
        const chartData = roleData.chart as any
        dashboardWidgets.push({
          id: "main-chart",
          title: chartData.title || "Chart",
          type: "chart",
          size: "lg",
          priority: 10,
          isVisible: true,
          component: () => (
            <MiniChart title={chartData.title || "Chart"} data={chartData.data || []} type={chartData.type || "line"} />
          ),
        })
      }

      // Add quick actions widget
      if (roleData && "quickActions" in roleData && Array.isArray(roleData.quickActions)) {
        dashboardWidgets.push({
          id: "quick-actions",
          title: "Quick Actions",
          type: "custom",
          size: "md",
          priority: 5,
          isVisible: true,
          component: () => <QuickActions actions={roleData.quickActions as any} />,
        })
      }

      // Add recent activities widget
      if (roleData && "recentActivity" in roleData && Array.isArray(roleData.recentActivity)) {
        dashboardWidgets.push({
          id: "recent-activities",
          title: "Recent Activities",
          type: "list",
          size: "md",
          priority: 8,
          isVisible: true,
          component: () => (
            <div className="p-4 text-sm text-muted-foreground">Recent activities will be shown here</div>
          ),
        })
      }

      // Add appointments widget
      if (roleData && "appointments" in roleData && Array.isArray(roleData.appointments)) {
        dashboardWidgets.push({
          id: "appointments",
          title: "Upcoming Appointments",
          type: "list",
          size: "lg",
          priority: 7,
          isVisible: true,
          component: () => <AppointmentQueue appointments={roleData.appointments} />,
        })
      }

      // Add task list widget if applicable
      if (roleData && "tasks" in roleData && Array.isArray(roleData.tasks)) {
        dashboardWidgets.push({
          id: "tasks",
          title: "Tasks",
          type: "list",
          size: "md",
          priority: 6,
          isVisible: true,
          component: () => <TaskList tasks={roleData.tasks} />,
        })
      }
    } catch (error) {
      console.error("Error generating widgets:", error)
      // Return minimal default widgets on error
      dashboardWidgets.push({
        id: "error-widget",
        title: "Dashboard",
        type: "metric",
        size: "sm",
        priority: 0,
        isVisible: true,
        component: () => <MetricCard title="Dashboard" value="Loading..." description="Please refresh the page" />,
      })
    }

    return dashboardWidgets
  }

  const widgets = generateWidgets()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {(user?.role || "User").charAt(0).toUpperCase() + (user?.role || "User").slice(1)} Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back, {user?.firstName ? `${user.firstName} ${user.lastName}` : "User"}. Here's what's happening today.</p>
      </div>

      <DraggableDashboard
        widgets={widgets}
        onWidgetOrderChange={newWidgets => {
          console.log("Widget order changed:", newWidgets)
        }}
        onWidgetToggle={(widgetId, isVisible) => {
          toast({
            title: isVisible ? "Widget shown" : "Widget hidden",
            description: `Widget has been ${isVisible ? "added to" : "removed from"} your dashboard`,
          })
        }}
      />
    </div>
  )
}
