"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Clock, AlertTriangle, CheckCircle } from "lucide-react"

// Mock data for charts
const appointmentData = [
  { name: "Mon", appointments: 12, completed: 10 },
  { name: "Tue", appointments: 15, completed: 14 },
  { name: "Wed", appointments: 18, completed: 16 },
  { name: "Thu", appointments: 14, completed: 12 },
  { name: "Fri", appointments: 20, completed: 18 },
  { name: "Sat", appointments: 8, completed: 7 },
  { name: "Sun", appointments: 5, completed: 5 },
]

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
]

const departmentData = [
  { name: "Emergency", value: 35, color: "#ef4444" },
  { name: "Cardiology", value: 25, color: "#3b82f6" },
  { name: "Pediatrics", value: 20, color: "#10b981" },
  { name: "Orthopedics", value: 15, color: "#f59e0b" },
  { name: "Other", value: 5, color: "#6b7280" },
]

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
}

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
}

export function MetricCard({ title, value, description, icon: Icon, trend, badge }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            {description}
            {trend && (
              <span className={`flex items-center gap-1 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                <TrendingUp className={`h-3 w-3 ${trend.isPositive ? "" : "rotate-180"}`} />
                {trend.value}%
              </span>
            )}
          </p>
        )}
        {badge && (
          <Badge variant={badge.variant} className="mt-2">
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export function AppointmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Appointments</CardTitle>
        <CardDescription>Scheduled vs completed appointments this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={appointmentData}>
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="appointments" fill="var(--color-appointments)" />
            <Bar dataKey="completed" fill="var(--color-completed)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Monthly revenue over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={revenueData}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DepartmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Distribution</CardTitle>
        <CardDescription>Patients by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <PieChart>
            <Pie
              data={departmentData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {departmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function TaskList({
  tasks,
}: { tasks: Array<{ id: string; title: string; priority: "high" | "medium" | "low"; completed: boolean }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
        <CardDescription>Your assigned tasks for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg border">
              <div
                className={`h-2 w-2 rounded-full ${
                  task.priority === "high"
                    ? "bg-red-500"
                    : task.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
              <span className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </span>
              {task.completed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PatientQueue({
  patients,
}: { patients: Array<{ id: string; name: string; time: string; status: "waiting" | "in-progress" | "completed" }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Queue</CardTitle>
        <CardDescription>Current patient status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patients.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-2 rounded-lg border">
              <div>
                <p className="font-medium text-sm">{patient.name}</p>
                <p className="text-xs text-muted-foreground">{patient.time}</p>
              </div>
              <Badge
                variant={
                  patient.status === "waiting" ? "outline" : patient.status === "in-progress" ? "default" : "secondary"
                }
              >
                {patient.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function InventoryStatus({
  items,
}: { items: Array<{ name: string; current: number; minimum: number; unit: string }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
        <CardDescription>Stock levels and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const percentage = (item.current / (item.minimum * 2)) * 100
            const isLow = item.current <= item.minimum

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {isLow && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm text-muted-foreground">
                      {item.current} {item.unit}
                    </span>
                  </div>
                </div>
                <Progress value={Math.min(percentage, 100)} className={isLow ? "bg-red-100" : ""} />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
