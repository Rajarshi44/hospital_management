"use client"

import { Search, Plus, LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { CommandPalette } from "@/components/command-palette/command-palette"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useRouter } from "next/navigation"
import { getUserFullName, getUserInitials } from "@/lib/auth"

export function AppHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  const getQuickActions = () => {
    const actions: Record<string, Array<{ label: string; action: () => void }>> = {
      ADMIN: [
        { label: "Add Staff Member", action: () => console.log("Add staff") },
        { label: "Generate Report", action: () => console.log("Generate report") },
      ],
      DOCTOR: [
        { label: "New Appointment", action: () => console.log("New appointment") },
        { label: "Add Prescription", action: () => console.log("Add prescription") },
      ],
      NURSE: [
        { label: "Record Vitals", action: () => console.log("Record vitals") },
        { label: "Add Task", action: () => console.log("Add task") },
      ],
      RECEPTIONIST: [
        { label: "Schedule Appointment", action: () => console.log("Schedule appointment") },
        { label: "Check-in Patient", action: () => console.log("Check-in patient") },
      ],
      LAB_TECHNICIAN: [
        { label: "Process Lab Sample", action: () => console.log("Process sample") },
        { label: "Add Lab Result", action: () => console.log("Add result") },
      ],
      PHARMACIST: [
        { label: "Process Prescription", action: () => console.log("Process prescription") },
        { label: "Update Inventory", action: () => console.log("Update inventory") },
      ],
      PATIENT: [
        { label: "Book Appointment", action: () => console.log("Book appointment") },
        { label: "Message Doctor", action: () => console.log("Message doctor") },
      ],
    }
    return actions[user.role] || []
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <>
      <CommandPalette />

      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search patients, appointments, records... (⌘K for commands)" className="pl-8" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Quick Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {getQuickActions().map((action, index) => (
                <DropdownMenuItem key={index} onClick={action.action}>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationCenter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || undefined} alt={getUserFullName(user)} />
                  <AvatarFallback>
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getUserFullName(user)}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
