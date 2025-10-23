// User Types
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "doctor" | "nurse" | "receptionist" | "pharmacist" | "patient"
  avatar?: string
  department?: string
  phone?: string
  specialization?: string
  licenseNumber?: string
  shift?: string
  dateOfBirth?: Date
  address?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  isActive: boolean
  lastLogin?: Date
}

// Patient Types
export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: "Male" | "Female" | "Other"
  phone: string
  email?: string
  address: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  insurance?: {
    provider: string
    policyNumber: string
    groupNumber: string
  }
  medicalHistory: MedicalHistory[]
  medications: PatientMedication[]
  vitalSigns: VitalSigns[]
  allergies: string[]
  bloodType?: string
  createdAt: Date
  updatedAt: Date
}

export interface MedicalHistory {
  id: string
  condition: string
  diagnosedDate: Date
  status: "Active" | "Resolved" | "Chronic"
  notes?: string
}

export interface PatientMedication {
  id: string
  name: string
  dosage: string
  frequency: string
  prescribedDate: Date
  prescribedBy: string
}

export interface VitalSigns {
  id: string
  date: Date
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  recordedBy: string
}

// Appointment Types
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  date: Date
  duration: number
  type: "Consultation" | "Follow-up" | "Emergency" | "Procedure"
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show"
  reason: string
  notes?: string
  priority: "low" | "medium" | "high" | "urgent"
  department: string
  createdAt: Date
  updatedAt: Date
}

// Medication Types
export interface Medication {
  id: string
  name: string
  genericName: string
  brandName?: string
  category: string
  description: string
  dosageForm: string
  strength: string
  manufacturer: string
  ndc: string
  rxcui?: string
  dea?: string
  isControlled: boolean
  sideEffects: string[]
  contraindications: string[]
  interactions: string[]
  createdAt: Date
  updatedAt: Date
}

// Prescription Types
export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  medicationId: string
  medicationName: string
  dosage: string
  quantity: number
  refills: number
  instructions: string
  prescribedDate: Date
  status: "pending" | "ready" | "filled" | "dispensed" | "cancelled"
  priority: "routine" | "urgent" | "stat"
  notes?: string
  pharmacistId?: string
  pharmacistName?: string
  filledDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Inventory Types
export interface InventoryItem {
  id: string
  medicationId: string
  medicationName: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  supplier: string
  lotNumber: string
  expiryDate: Date
  location: string
  lastRestocked: Date
  status: "in-stock" | "low-stock" | "out-of-stock" | "expiring-soon" | "expired"
  createdAt: Date
  updatedAt: Date
}

// Doctor Types
export interface Doctor {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: Date
  gender: "Male" | "Female" | "Other"
  address: string
  specialization: string
  subSpecialty?: string
  department: string
  licenseNumber: string
  licenseExpiry: Date
  medicalDegree: string
  medicalSchool: string
  graduationYear: number
  residency?: {
    hospital: string
    specialty: string
    startYear: number
    endYear: number
  }
  fellowship?: {
    hospital: string
    specialty: string
    startYear: number
    endYear: number
  }
  boardCertifications: {
    board: string
    specialty: string
    certificationDate: Date
    expiryDate: Date
  }[]
  experience: number // years of experience
  languagesSpoken: string[]
  consultationFee: number
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  schedule: {
    monday: { start: string; end: string; isWorking: boolean }
    tuesday: { start: string; end: string; isWorking: boolean }
    wednesday: { start: string; end: string; isWorking: boolean }
    thursday: { start: string; end: string; isWorking: boolean }
    friday: { start: string; end: string; isWorking: boolean }
    saturday: { start: string; end: string; isWorking: boolean }
    sunday: { start: string; end: string; isWorking: boolean }
  }
  isActive: boolean
  joinDate: Date
  profileImage?: string
  biography?: string
  achievements?: string[]
  publications?: {
    title: string
    journal: string
    publicationDate: Date
    doi?: string
  }[]
  createdAt: Date
  updatedAt: Date
}

// Dashboard Types
export interface DashboardStats {
  [key: string]: any
}

export interface Activity {
  id: string
  type: string
  message: string
  time: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "urgent" | "reminder"
  read: boolean
}
