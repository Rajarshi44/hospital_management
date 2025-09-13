"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  Pill,
  TestTube,
  DollarSign,
  Settings,
  Search,
  Plus,
  User,
  Stethoscope,
  Building,
  Phone,
  Calculator,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface Command {
  id: string
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  shortcut?: string
  category: string
  roles?: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  // Toggle command palette with Ctrl/Cmd + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const commands: Command[] = [
    // Navigation Commands
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      description: "View your main dashboard",
      icon: Building,
      action: () => router.push("/dashboard"),
      shortcut: "⌘D",
      category: "Navigation",
    },
    {
      id: "nav-appointments",
      title: "View Appointments",
      description: "Manage appointments and scheduling",
      icon: Calendar,
      action: () => router.push("/appointments"),
      shortcut: "⌘A",
      category: "Navigation",
    },
    {
      id: "nav-patients",
      title: "Patient Records",
      description: "Access patient information and medical records",
      icon: Users,
      action: () => router.push("/patients"),
      shortcut: "⌘P",
      category: "Navigation",
    },
    {
      id: "nav-pharmacy",
      title: "Pharmacy",
      description: "Manage medications and prescriptions",
      icon: Pill,
      action: () => router.push("/pharmacy"),
      category: "Navigation",
      roles: ["admin", "doctor", "pharmacist"],
    },
    {
      id: "nav-lab",
      title: "Laboratory",
      description: "Lab orders and test results",
      icon: TestTube,
      action: () => router.push("/lab"),
      category: "Navigation",
      roles: ["admin", "doctor", "nurse"],
    },
    {
      id: "nav-billing",
      title: "Billing & Invoices",
      description: "Financial management and billing",
      icon: DollarSign,
      action: () => router.push("/billing"),
      category: "Navigation",
      roles: ["admin", "receptionist"],
    },

    // Quick Actions
    {
      id: "action-new-appointment",
      title: "Schedule New Appointment",
      description: "Book a new patient appointment",
      icon: Plus,
      action: () => {
        toast({
          title: "New Appointment",
          description: "Opening appointment scheduler...",
        })
        router.push("/appointments?action=new")
      },
      shortcut: "⌘N",
      category: "Quick Actions",
      roles: ["admin", "doctor", "receptionist"],
    },
    {
      id: "action-add-patient",
      title: "Add New Patient",
      description: "Register a new patient",
      icon: User,
      action: () => {
        toast({
          title: "New Patient",
          description: "Opening patient registration form...",
        })
        router.push("/patients?action=new")
      },
      category: "Quick Actions",
      roles: ["admin", "receptionist", "nurse"],
    },
    {
      id: "action-emergency",
      title: "Emergency Alert",
      description: "Trigger emergency notification",
      icon: Phone,
      action: () => {
        toast({
          title: "Emergency Alert",
          description: "Emergency notification sent to all staff",
          variant: "destructive",
        })
      },
      shortcut: "⌘E",
      category: "Quick Actions",
      roles: ["admin", "doctor", "nurse"],
    },

    // Search Commands
    {
      id: "search-patient",
      title: "Search Patients",
      description: "Find patient by name or ID",
      icon: Search,
      action: () => {
        router.push("/patients")
        toast({
          title: "Patient Search",
          description: "Use the search bar to find patients",
        })
      },
      category: "Search",
    },
    {
      id: "search-appointment",
      title: "Find Appointment",
      description: "Search for specific appointments",
      icon: Calendar,
      action: () => {
        router.push("/appointments")
        toast({
          title: "Appointment Search",
          description: "Use filters to find appointments",
        })
      },
      category: "Search",
    },

    // Tools
    {
      id: "tool-calculator",
      title: "Medical Calculator",
      description: "BMI, dosage, and medical calculations",
      icon: Calculator,
      action: () => {
        toast({
          title: "Medical Calculator",
          description: "Opening calculation tools...",
        })
      },
      category: "Tools",
      roles: ["doctor", "nurse", "pharmacist"],
    },
    {
      id: "tool-vitals",
      title: "Record Vitals",
      description: "Quick vital signs entry",
      icon: Stethoscope,
      action: () => {
        toast({
          title: "Vital Signs",
          description: "Opening vitals recording form...",
        })
      },
      category: "Tools",
      roles: ["doctor", "nurse"],
    },

    // Settings
    {
      id: "settings-profile",
      title: "Profile Settings",
      description: "Update your profile information",
      icon: User,
      action: () => {
        toast({
          title: "Profile Settings",
          description: "Opening profile settings...",
        })
      },
      category: "Settings",
    },
    {
      id: "settings-system",
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      action: () => {
        toast({
          title: "System Settings",
          description: "Opening system configuration...",
        })
      },
      category: "Settings",
      roles: ["admin"],
    },
  ]

  // Filter commands based on user role
  const filteredCommands = commands.filter((command) => {
    if (!command.roles) return true
    return user && command.roles.includes(user.role)
  })

  // Group commands by category
  const groupedCommands = filteredCommands.reduce(
    (groups, command) => {
      const category = command.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(command)
      return groups
    },
    {} as Record<string, Command[]>,
  )

  const handleCommand = (command: Command) => {
    setOpen(false)
    command.action()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {Object.entries(groupedCommands).map(([category, commands]) => (
          <CommandGroup key={category} heading={category}>
            {commands.map((command) => (
              <CommandItem key={command.id} onSelect={() => handleCommand(command)} className="flex items-center gap-3">
                <command.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{command.title}</div>
                  {command.description && <div className="text-xs text-muted-foreground">{command.description}</div>}
                </div>
                {command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>}
                {command.roles && (
                  <Badge variant="secondary" className="text-xs">
                    {command.roles.join(", ")}
                  </Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
