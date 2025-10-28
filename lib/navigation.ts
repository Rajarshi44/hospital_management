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
  Bed,
  UserCog,
  Shield,
  Bell,
  Heart,
  Stethoscope,
  MapPin,
  CreditCard,
  TrendingUp,
  Clock,
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
    ADMIN: [
      ...baseNavigation,
      {
        title: "Doctor Management",
        url: "/doctors",
        icon: Stethoscope,
        items: [
          { title: "All Doctors", url: "/doctors", icon: Users },
          { title: "Register Doctor", url: "/doctors/register", icon: UserCheck },
          { title: "Departments", url: "/doctors/departments", icon: Building2 },
          { title: "Schedules", url: "/doctors/schedules", icon: Calendar },
        ],
      },
      {
        title: "Patient Management",
        url: "/patients",
        icon: Heart,
        items: [
          { title: "OPD Patients", url: "/patients", icon: Users },
          {
            title: "IPD Management",
            url: "/ipd",
            icon: Bed,
            items: [
              { title: "Admission", url: "/ipd/admission", icon: UserCheck },
              { title: "Inpatient List", url: "/ipd/inpatient", icon: Activity },
              { title: "Discharge", url: "/ipd/discharge", icon: FileText },
            ],
          },
          { title: "Patient History", url: "/patients/history", icon: FileText },
        ],
      },
      {
        title: "Appointments",
        url: "/appointments",
        icon: Calendar,
      },
      {
        title: "Lab Management",
        url: "/lab",
        icon: TestTube,
        items: [
          { title: "Tests", url: "/lab", icon: TestTube },
          { title: "Reports", url: "/lab/reports", icon: FileText },
        ],
      },
      {
        title: "Billing & Payments",
        url: "/billing",
        icon: CreditCard,
      },
      {
        title: "Ward/Bed Management",
        url: "/wards",
        icon: Bed,
      },
      {
        title: "Staff/HR Management",
        url: "/staff",
        icon: UserCog,
        items: [
          { title: "Nurses", url: "/staff/nurses", icon: Users },
          { title: "Receptionists", url: "/staff/receptionists", icon: Users },
          { title: "Technicians", url: "/staff/technicians", icon: Users },
          { title: "Duty Roster", url: "/staff/roster", icon: Clock },
        ],
      },
      {
        title: "Insurance / TPA",
        url: "/insurance",
        icon: Shield,
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FolderOpen,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: TrendingUp,
        items: [
          { title: "Revenue", url: "/reports/revenue", icon: Receipt },
          { title: "Operations", url: "/reports/operations", icon: Activity },
          { title: "Staff Performance", url: "/reports/staff", icon: Users },
        ],
      },
      {
        title: "Notifications / Alerts",
        url: "/notifications",
        icon: Bell,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
    DOCTOR: [
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
    NURSE: [
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
    RECEPTIONIST: [
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
    LAB_TECHNICIAN: [
      ...baseNavigation,
      {
        title: "Lab Tests",
        url: "/lab",
        icon: TestTube,
        badge: "8",
      },
      {
        title: "Patients",
        url: "/patients",
        icon: Users,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: FileText,
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FolderOpen,
      },
    ],
    PHARMACIST: [
      ...baseNavigation,
      {
        title: "Prescriptions",
        url: "/prescriptions",
        icon: Pill,
        badge: "7",
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
    PATIENT: [
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

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    ADMIN: "Administrator",
    DOCTOR: "Doctor",
    NURSE: "Nurse",
    RECEPTIONIST: "Receptionist",
    LAB_TECHNICIAN: "Lab Technician",
    PHARMACIST: "Pharmacist",
    PATIENT: "Patient",
  }
  return roleNames[role] || role.toLowerCase().replace("_", " ")
}

export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    DOCTOR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    NURSE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    RECEPTIONIST: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    LAB_TECHNICIAN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PHARMACIST: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    PATIENT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  }
  return roleColors[role] || "bg-gray-100 text-gray-800"
}
