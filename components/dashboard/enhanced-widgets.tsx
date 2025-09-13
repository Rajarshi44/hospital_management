"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
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
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Enhanced Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  badge?: {
    text: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  badge,
  className 
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("h-full", className)}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{value}</div>
              {badge && (
                <Badge variant={badge.variant} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            
            {trend && (
              <div className="flex items-center text-xs">
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={cn(
                  "font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.value}%
                </span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Quick Actions Widget
interface QuickAction {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "secondary" | "destructive" | "outline"
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-3">Quick Actions</div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              className="w-full h-16 flex flex-col gap-1"
            >
              <action.icon className="h-4 w-4" />
              <span className="text-xs">{action.title}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Appointment Queue Widget
interface AppointmentQueueItem {
  id: string
  patientName: string
  time: string
  status: "waiting" | "in-progress" | "completed" | "cancelled"
  avatar?: string
}

interface AppointmentQueueProps {
  appointments: AppointmentQueueItem[]
}

export function AppointmentQueue({ appointments }: AppointmentQueueProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-100 text-yellow-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-3">Today's Queue</div>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={appointment.avatar} />
                <AvatarFallback>
                  {appointment.patientName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{appointment.patientName}</div>
                <div className="text-xs text-muted-foreground">{appointment.time}</div>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getStatusColor(appointment.status))}
            >
              {appointment.status}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Task List Widget
interface Task {
  id: string
  title: string
  priority: "low" | "medium" | "high"
  completed: boolean
  dueTime?: string
}

interface TaskListProps {
  tasks: Task[]
  onTaskToggle?: (taskId: string) => void
}

export function TaskList({ tasks, onTaskToggle }: TaskListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500"
      case "medium": return "border-l-yellow-500"
      case "low": return "border-l-green-500"
      default: return "border-l-gray-300"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-3">Tasks</div>
      <div className="space-y-1 flex-1 overflow-y-auto">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-2 rounded border-l-4 bg-card cursor-pointer transition-all",
              getPriorityColor(task.priority),
              task.completed && "opacity-60"
            )}
            onClick={() => onTaskToggle?.(task.id)}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded border",
                task.completed ? "bg-green-500 border-green-500" : "border-gray-300"
              )}>
                {task.completed && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className={cn(
                  "text-sm",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </div>
                {task.dueTime && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {task.dueTime}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Mini Chart Widget
interface ChartData {
  name: string
  value: number
  color?: string
}

interface MiniChartProps {
  title: string
  data: ChartData[]
  type: "bar" | "line" | "pie"
  height?: number
}

export function MiniChart({ title, data, type, height = 150 }: MiniChartProps) {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="flex-1">
        {renderChart()}
      </div>
    </div>
  )
}

// Activity Feed Widget
interface ActivityItem {
  id: string
  title: string
  description: string
  time: string
  type: "info" | "success" | "warning" | "error"
  avatar?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-100 text-green-800"
      case "warning": return "bg-yellow-100 text-yellow-800"
      case "error": return "bg-red-100 text-red-800"
      default: return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-3">Recent Activity</div>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3"
          >
            <div className={cn(
              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
              getTypeColor(activity.type).replace("text-", "bg-").split(" ")[0]
            )} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{activity.title}</div>
              <div className="text-xs text-muted-foreground">{activity.description}</div>
              <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}