export interface UserProfile {
  id: string
  name: string
  email: string
  role: "admin" | "doctor" | "nurse" | "receptionist" | "pharmacist" | "patient"
  department?: string
  phone?: string
  avatar?: string
  status: "active" | "inactive" | "suspended"
  lastLogin?: Date
  createdAt: Date
  permissions: string[]
}

export interface SystemSettings {
  hospitalName: string
  hospitalAddress: string
  hospitalPhone: string
  hospitalEmail: string
  timezone: string
  dateFormat: string
  currency: string
  language: string
  theme: "light" | "dark" | "system"
  emailNotifications: boolean
  smsNotifications: boolean
  autoBackup: boolean
  backupFrequency: "daily" | "weekly" | "monthly"
  sessionTimeout: number // in minutes
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    expirationDays: number
  }
}

export interface Department {
  id: string
  name: string
  description: string
  headOfDepartment?: string
  staffCount: number
  budget?: number
  status: "active" | "inactive"
}

// Mock data
export const mockUsers: UserProfile[] = [
  {
    id: "user-1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@hospital.com",
    role: "doctor",
    department: "Cardiology",
    phone: "+1 (555) 123-4567",
    status: "active",
    lastLogin: new Date("2024-01-15T14:30:00"),
    createdAt: new Date("2023-06-01T09:00:00"),
    permissions: ["view_patients", "edit_patients", "prescribe_medication", "order_tests"],
  },
  {
    id: "user-2",
    name: "Dr. Michael Chen",
    email: "michael.chen@hospital.com",
    role: "doctor",
    department: "Emergency",
    phone: "+1 (555) 987-6543",
    status: "active",
    lastLogin: new Date("2024-01-15T16:45:00"),
    createdAt: new Date("2023-08-15T10:30:00"),
    permissions: ["view_patients", "edit_patients", "prescribe_medication", "order_tests", "emergency_access"],
  },
  {
    id: "user-3",
    name: "Nurse Jennifer Wilson",
    email: "jennifer.wilson@hospital.com",
    role: "nurse",
    department: "General Ward",
    phone: "+1 (555) 456-7890",
    status: "active",
    lastLogin: new Date("2024-01-15T08:15:00"),
    createdAt: new Date("2023-09-01T08:00:00"),
    permissions: ["view_patients", "record_vitals", "administer_medication"],
  },
  {
    id: "user-4",
    name: "Admin User",
    email: "admin@hospital.com",
    role: "admin",
    phone: "+1 (555) 111-2222",
    status: "active",
    lastLogin: new Date("2024-01-15T17:00:00"),
    createdAt: new Date("2023-01-01T00:00:00"),
    permissions: ["full_access", "user_management", "system_settings", "reports"],
  },
]

export const mockSystemSettings: SystemSettings = {
  hospitalName: "General Hospital",
  hospitalAddress: "123 Medical Center Drive, Healthcare City, HC 12345",
  hospitalPhone: "+1 (555) 000-1234",
  hospitalEmail: "info@generalhospital.com",
  timezone: "America/New_York",
  dateFormat: "MM/DD/YYYY",
  currency: "USD",
  language: "en",
  theme: "system",
  emailNotifications: true,
  smsNotifications: false,
  autoBackup: true,
  backupFrequency: "daily",
  sessionTimeout: 60,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expirationDays: 90,
  },
}

export const mockDepartments: Department[] = [
  {
    id: "dept-1",
    name: "Cardiology",
    description: "Heart and cardiovascular system care",
    headOfDepartment: "Dr. Sarah Johnson",
    staffCount: 12,
    budget: 500000,
    status: "active",
  },
  {
    id: "dept-2",
    name: "Emergency",
    description: "Emergency and trauma care",
    headOfDepartment: "Dr. Michael Chen",
    staffCount: 25,
    budget: 750000,
    status: "active",
  },
  {
    id: "dept-3",
    name: "General Ward",
    description: "General patient care and recovery",
    headOfDepartment: "Head Nurse Mary Smith",
    staffCount: 18,
    budget: 300000,
    status: "active",
  },
  {
    id: "dept-4",
    name: "Pharmacy",
    description: "Medication management and dispensing",
    headOfDepartment: "PharmD Robert Davis",
    staffCount: 8,
    budget: 200000,
    status: "active",
  },
]

export const availablePermissions = [
  { id: "view_patients", name: "View Patients", description: "View patient information and records" },
  { id: "edit_patients", name: "Edit Patients", description: "Modify patient information and records" },
  { id: "prescribe_medication", name: "Prescribe Medication", description: "Create and manage prescriptions" },
  { id: "order_tests", name: "Order Tests", description: "Order laboratory and diagnostic tests" },
  { id: "record_vitals", name: "Record Vitals", description: "Record patient vital signs" },
  { id: "administer_medication", name: "Administer Medication", description: "Administer medications to patients" },
  { id: "emergency_access", name: "Emergency Access", description: "Access emergency patient information" },
  { id: "user_management", name: "User Management", description: "Manage user accounts and permissions" },
  { id: "system_settings", name: "System Settings", description: "Configure system settings" },
  { id: "reports", name: "Reports", description: "Generate and view system reports" },
  { id: "full_access", name: "Full Access", description: "Complete system access (Admin only)" },
]
