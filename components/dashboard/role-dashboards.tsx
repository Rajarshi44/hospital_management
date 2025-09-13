"use client"

import { useAuth } from "@/hooks/use-auth"
import {
  MetricCard,
  AppointmentChart,
  RevenueChart,
  DepartmentChart,
  TaskList,
  PatientQueue,
  InventoryStatus,
} from "./dashboard-widgets"
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
} from "lucide-react"

// Mock data for different roles
const mockData = {
  admin: {
    metrics: [
      {
        title: "Total Patients",
        value: "1,234",
        description: "+12% from last month",
        icon: Users,
        trend: { value: 12, isPositive: true },
      },
      { title: "Staff Members", value: "156", description: "Across 8 departments", icon: Building2 },
      {
        title: "Monthly Revenue",
        value: "$67,000",
        description: "+8% from last month",
        icon: DollarSign,
        trend: { value: 8, isPositive: true },
      },
      {
        title: "Bed Occupancy",
        value: "87%",
        description: "245/280 beds occupied",
        icon: Activity,
        badge: { text: "High", variant: "destructive" as const },
      },
    ],
  },
  doctor: {
    metrics: [
      {
        title: "Today's Appointments",
        value: "12",
        description: "3 pending",
        icon: Calendar,
        badge: { text: "3 Pending", variant: "outline" as const },
      },
      { title: "My Patients", value: "45", description: "Active under care", icon: UserCheck },
      {
        title: "Lab Results",
        value: "8",
        description: "Awaiting review",
        icon: TestTube,
        badge: { text: "Review Needed", variant: "destructive" as const },
      },
      { title: "Prescriptions", value: "23", description: "Issued this week", icon: Pill },
    ],
    tasks: [
      { id: "1", title: "Review lab results for John Doe", priority: "high" as const, completed: false },
      { id: "2", title: "Follow-up call with Sarah Smith", priority: "medium" as const, completed: false },
      { id: "3", title: "Update treatment plan for Mike Johnson", priority: "high" as const, completed: true },
      { id: "4", title: "Prescription renewal for Emma Wilson", priority: "low" as const, completed: false },
    ],
    patients: [
      { id: "1", name: "John Doe", time: "9:00 AM", status: "waiting" as const },
      { id: "2", name: "Sarah Smith", time: "9:30 AM", status: "in-progress" as const },
      { id: "3", name: "Mike Johnson", time: "10:00 AM", status: "completed" as const },
      { id: "4", name: "Emma Wilson", time: "10:30 AM", status: "waiting" as const },
    ],
  },
  nurse: {
    metrics: [
      { title: "Assigned Patients", value: "18", description: "Current shift", icon: UserCheck },
      {
        title: "Medications Due",
        value: "12",
        description: "Next 2 hours",
        icon: Pill,
        badge: { text: "Urgent", variant: "destructive" as const },
      },
      { title: "Vitals Recorded", value: "24", description: "Today", icon: Activity },
      { title: "Tasks Completed", value: "15/20", description: "75% completion rate", icon: CheckCircle },
    ],
    tasks: [
      { id: "1", title: "Administer medication to Room 204", priority: "high" as const, completed: false },
      { id: "2", title: "Record vitals for Room 301", priority: "medium" as const, completed: true },
      { id: "3", title: "Assist with patient transfer", priority: "high" as const, completed: false },
      { id: "4", title: "Update patient charts", priority: "low" as const, completed: false },
    ],
    patients: [
      { id: "1", name: "Room 204 - Alice Brown", time: "Medication due", status: "waiting" as const },
      { id: "2", name: "Room 301 - Bob Wilson", time: "Vitals check", status: "in-progress" as const },
      { id: "3", name: "Room 205 - Carol Davis", time: "Completed", status: "completed" as const },
    ],
  },
  receptionist: {
    metrics: [
      {
        title: "Today's Appointments",
        value: "45",
        description: "8 check-ins pending",
        icon: Calendar,
        badge: { text: "8 Pending", variant: "outline" as const },
      },
      { title: "Walk-ins", value: "7", description: "Waiting to be scheduled", icon: Users },
      { title: "Phone Calls", value: "23", description: "Handled today", icon: Activity },
      {
        title: "No-shows",
        value: "3",
        description: "Today",
        icon: AlertTriangle,
        badge: { text: "Follow-up needed", variant: "destructive" as const },
      },
    ],
    patients: [
      { id: "1", name: "David Miller", time: "Check-in", status: "waiting" as const },
      { id: "2", name: "Lisa Garcia", time: "Insurance verification", status: "in-progress" as const },
      { id: "3", name: "Tom Anderson", time: "Completed", status: "completed" as const },
    ],
  },
  pharmacist: {
    metrics: [
      {
        title: "Prescriptions",
        value: "28",
        description: "Pending processing",
        icon: Pill,
        badge: { text: "7 Urgent", variant: "destructive" as const },
      },
      { title: "Inventory Items", value: "1,245", description: "In stock", icon: Activity },
      {
        title: "Low Stock Alerts",
        value: "12",
        description: "Require reordering",
        icon: AlertTriangle,
        badge: { text: "Action needed", variant: "destructive" as const },
      },
      { title: "Consultations", value: "15", description: "Completed today", icon: Users },
    ],
    inventory: [
      { name: "Amoxicillin 500mg", current: 45, minimum: 50, unit: "bottles" },
      { name: "Ibuprofen 200mg", current: 120, minimum: 100, unit: "bottles" },
      { name: "Insulin Pens", current: 8, minimum: 20, unit: "boxes" },
      { name: "Blood Pressure Monitors", current: 3, minimum: 5, unit: "units" },
    ],
  },
  patient: {
    metrics: [
      { title: "Upcoming Appointments", value: "2", description: "Next: Tomorrow 2:00 PM", icon: Calendar },
      { title: "Prescriptions", value: "3", description: "Active medications", icon: Pill },
      {
        title: "Lab Results",
        value: "1",
        description: "New result available",
        icon: TestTube,
        badge: { text: "New", variant: "default" as const },
      },
      {
        title: "Messages",
        value: "2",
        description: "From healthcare team",
        icon: Activity,
        badge: { text: "Unread", variant: "outline" as const },
      },
    ],
  },
}

export function RoleDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const data = mockData[user.role]

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Role-specific content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin Dashboard */}
        {user.role === "admin" && (
          <>
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <DepartmentChart />
            <div className="lg:col-span-2">
              <AppointmentChart />
            </div>
          </>
        )}

        {/* Doctor Dashboard */}
        {user.role === "doctor" && (
          <>
            <PatientQueue patients={data.patients || []} />
            <TaskList tasks={data.tasks || []} />
            <div className="lg:col-span-1">
              <AppointmentChart />
            </div>
          </>
        )}

        {/* Nurse Dashboard */}
        {user.role === "nurse" && (
          <>
            <TaskList tasks={data.tasks || []} />
            <PatientQueue patients={data.patients || []} />
            <div className="lg:col-span-1">
              <AppointmentChart />
            </div>
          </>
        )}

        {/* Receptionist Dashboard */}
        {user.role === "receptionist" && (
          <>
            <PatientQueue patients={data.patients || []} />
            <div className="lg:col-span-2">
              <AppointmentChart />
            </div>
          </>
        )}

        {/* Pharmacist Dashboard */}
        {user.role === "pharmacist" && (
          <>
            <InventoryStatus items={data.inventory || []} />
            <div className="lg:col-span-2">
              <AppointmentChart />
            </div>
          </>
        )}

        {/* Patient Dashboard */}
        {user.role === "patient" && (
          <>
            <div className="lg:col-span-3">
              <AppointmentChart />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
