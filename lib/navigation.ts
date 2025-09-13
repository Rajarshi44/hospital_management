import {
  LayoutDashboard,
  Calendar,
  Users,
  Pill,
  TestTube,
  Receipt,
  Settings,
  UserCheck,
  ClipboardList,
  Building2,
  FileText,
  Activity,
  FolderOpen,
} from "lucide-react"
import type { UserRole } from "./auth"

export interface NavigationItem {
  title: string
  url: string
  icon: any
  badge?: string
  items?: NavigationItem[]
}

export const getNavigationForRole = (role: UserRole): NavigationItem[] => {
  const baseNavigation: NavigationItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ]

  const roleSpecificNavigation: Record<UserRole, NavigationItem[]> = {
    admin: [
      ...baseNavigation,
      {
        title: "Staff Management",
        url: "/staff",
        icon: Users,
        items: [
          { title: "All Staff", url: "/staff", icon: Users },
          { title: "Departments", url: "/staff/departments", icon: Building2 },
          { title: "Schedules", url: "/staff/schedules", icon: Calendar },
        ],
      },
      {
        title: "Appointments",
        url: "/appointments",
        icon: Calendar,
      },
      {
        title: "Patients",
        url: "/patients",
        icon: UserCheck,
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FolderOpen,
      },
      {
        title: "Lab Management",
        url: "/lab",
        icon: TestTube,
      },
      {
        title: "Billing",
        url: "/billing",
        icon: Receipt,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: FileText,
        items: [
          { title: "Revenue", url: "/reports/revenue", icon: Receipt },
          { title: "Operations", url: "/reports/operations", icon: Activity },
          { title: "Staff Performance", url: "/reports/staff", icon: Users },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
    doctor: [
      ...baseNavigation,
      {
        title: "Appointments",
        url: "/appointments",
        icon: Calendar,
        badge: "5",
      },
      {
        title: "Patients",
        url: "/patients",
        icon: UserCheck,
        items: [
          { title: "My Patients", url: "/patients/my", icon: UserCheck },
          { title: "Patient Search", url: "/patients/search", icon: Users },
        ],
      },
      {
        title: "Prescriptions",
        url: "/prescriptions",
        icon: Pill,
      },
      {
        title: "Lab Results",
        url: "/lab",
        icon: TestTube,
        badge: "3",
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FolderOpen,
      },
    ],
    nurse: [
      ...baseNavigation,
      {
        title: "Patients",
        url: "/patients",
        icon: UserCheck,
        badge: "12",
      },
      {
        title: "Medications",
        url: "/medications",
        icon: Pill,
        badge: "8",
      },
      {
        title: "Vitals",
        url: "/vitals",
        icon: Activity,
      },
      {
        title: "Tasks",
        url: "/tasks",
        icon: ClipboardList,
        badge: "6",
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FolderOpen,
      },
    ],
    receptionist: [
      ...baseNavigation,
      {
        title: "Appointments",
        url: "/appointments",
        icon: Calendar,
        badge: "15",
      },
      {
        title: "Check-in",
        url: "/checkin",
        icon: UserCheck,
        badge: "4",
      },
      {
        title: "Patients",
        url: "/patients",
        icon: Users,
      },
      {
        title: "Billing",
        url: "/billing",
        icon: Receipt,
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FolderOpen,
      },
    ],
    pharmacist: [
      ...baseNavigation,
      {
        title: "Prescriptions",
        url: "/prescriptions",
        icon: Pill,
        badge: "7",
      },
      {
        title: "Inventory",
        url: "/inventory",
        icon: ClipboardList,
        items: [
          { title: "Stock Levels", url: "/inventory/stock", icon: ClipboardList },
          { title: "Low Stock", url: "/inventory/low-stock", icon: ClipboardList, badge: "12" },
          { title: "Orders", url: "/inventory/orders", icon: Receipt },
        ],
      },
      {
        title: "Patients",
        url: "/patients",
        icon: Users,
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FolderOpen,
      },
    ],
    patient: [
      ...baseNavigation,
      {
        title: "Appointments",
        url: "/appointments",
        icon: Calendar,
      },
      {
        title: "Medical Records",
        url: "/records",
        icon: FileText,
      },
      {
        title: "Prescriptions",
        url: "/prescriptions",
        icon: Pill,
      },
      {
        title: "Lab Results",
        url: "/lab",
        icon: TestTube,
      },
      {
        title: "Billing",
        url: "/billing",
        icon: Receipt,
      },
      {
        title: "My Documents",
        url: "/documents",
        icon: FolderOpen,
      },
    ],
  }

  return roleSpecificNavigation[role] || baseNavigation
}
