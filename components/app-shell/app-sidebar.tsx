"use client"

import { Heart, ChevronUp, User2, LogOut, Moon, Sun } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { getNavigationForRole } from "@/lib/navigation"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AppSidebar() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  if (!user) return null

  const navigation = getNavigationForRole(user.role)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: "Administrator",
      doctor: "Doctor",
      nurse: "Nurse",
      receptionist: "Receptionist",
      pharmacist: "Pharmacist",
      patient: "Patient",
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getRoleColor = (role: string) => {
    const roleColors = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      doctor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      nurse: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      receptionist: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      pharmacist: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      patient: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    }
    return roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Hospital HMS</span>
                <span className="truncate text-xs">Management System</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible asChild defaultOpen={item.items.some((subItem) => pathname === subItem.url)}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className="ml-auto h-5 w-5 shrink-0 items-center justify-center rounded-full p-0 text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <a href={subItem.url}>
                                    <subItem.icon />
                                    <span>{subItem.title}</span>
                                    {subItem.badge && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-auto h-4 w-4 shrink-0 items-center justify-center rounded-full p-0 text-xs"
                                      >
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 w-5 shrink-0 items-center justify-center rounded-full p-0 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.department || getRoleDisplayName(user.role)}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>{getRoleDisplayName(user.role)}</Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <User2 className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-red-600" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
