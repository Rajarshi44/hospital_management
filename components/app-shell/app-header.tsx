"use client"

import { Plus, LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
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

        <div className="flex flex-1 items-center gap-2">{/* Search removed */}</div>

        <div className="flex items-center gap-3">
          {/* User Profile Info */}
          <div className="hidden md:flex flex-col items-end mr-2">
            <p className="text-sm font-semibold">{getUserFullName(user)}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase().replace("_", " ")}</p>
          </div>

          {/* User Menu Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary p-1">
                <Avatar className="h-10 w-10 border-2 border-primary cursor-pointer hover:border-primary/80 transition-colors">
                  <AvatarImage src={user.avatar || undefined} alt={getUserFullName(user)} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 mr-4 mt-2 z-[100] bg-white shadow-xl border-2"
              align="end"
              sideOffset={8}
              alignOffset={-5}
            >
              <DropdownMenuLabel className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 mt-1">
                    <AvatarImage src={user.avatar || undefined} alt={getUserFullName(user)} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1.5 flex-1">
                    <p className="text-base font-bold leading-none">{getUserFullName(user)}</p>
                    <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                    <p className="text-xs font-medium text-primary capitalize mt-1">
                      {user.role.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="py-3 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer focus:bg-red-50 focus:text-red-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span className="font-semibold text-base">Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
