import {
  mockUsers,
  mockPatients,
  mockAppointments,
  mockPrescriptions,
  mockInventory,
  mockDashboardStats,
} from "./mock-data"
import type { User, Appointment, Patient, Prescription, InventoryItem } from "./types"

// Simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Authentication Service
export class AuthService {
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(800)

    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // In a real app, you'd verify the password
    if (password !== "password") {
      throw new Error("Invalid credentials")
    }

    return {
      user,
      token: `mock-token-${user.id}-${Date.now()}`,
    }
  }

  static async getCurrentUser(token: string): Promise<User | null> {
    await delay(200)

    // Extract user ID from mock token
    const userId = token.split("-")[2]
    return mockUsers.find((u) => u.id === userId) || null
  }

  static async logout(): Promise<void> {
    await delay(200)
    // Clear any stored tokens
  }
}

// Patient Service
export class PatientService {
  static async getPatients(search?: string): Promise<Patient[]> {
    await delay(400)

    let patients = [...mockPatients]

    if (search) {
      const searchLower = search.toLowerCase()
      patients = patients.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower) ||
          p.id.toLowerCase().includes(searchLower) ||
          p.email?.toLowerCase().includes(searchLower),
      )
    }

    return patients
  }

  static async getPatient(id: string): Promise<Patient | null> {
    await delay(300)
    return mockPatients.find((p) => p.id === id) || null
  }

  static async createPatient(patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
    await delay(600)

    const newPatient: Patient = {
      ...patient,
      id: `P${String(mockPatients.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockPatients.push(newPatient)
    return newPatient
  }

  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    await delay(500)

    const index = mockPatients.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error("Patient not found")
    }

    mockPatients[index] = {
      ...mockPatients[index],
      ...updates,
      updatedAt: new Date(),
    }

    return mockPatients[index]
  }
}

// Appointment Service
export class AppointmentService {
  static async getAppointments(filters?: {
    date?: Date
    doctorId?: string
    patientId?: string
    status?: string
  }): Promise<Appointment[]> {
    await delay(400)

    let appointments = [...mockAppointments]

    if (filters?.date) {
      const filterDate = filters.date.toDateString()
      appointments = appointments.filter((a) => a.date.toDateString() === filterDate)
    }

    if (filters?.doctorId) {
      appointments = appointments.filter((a) => a.doctorId === filters.doctorId)
    }

    if (filters?.patientId) {
      appointments = appointments.filter((a) => a.patientId === filters.patientId)
    }

    if (filters?.status) {
      appointments = appointments.filter((a) => a.status === filters.status)
    }

    return appointments.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  static async getAppointment(id: string): Promise<Appointment | null> {
    await delay(300)
    return mockAppointments.find((a) => a.id === id) || null
  }

  static async createAppointment(
    appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Appointment> {
    await delay(600)

    const newAppointment: Appointment = {
      ...appointment,
      id: `APT${String(mockAppointments.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockAppointments.push(newAppointment)
    return newAppointment
  }

  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    await delay(500)

    const index = mockAppointments.findIndex((a) => a.id === id)
    if (index === -1) {
      throw new Error("Appointment not found")
    }

    mockAppointments[index] = {
      ...mockAppointments[index],
      ...updates,
      updatedAt: new Date(),
    }

    return mockAppointments[index]
  }

  static async deleteAppointment(id: string): Promise<void> {
    await delay(400)

    const index = mockAppointments.findIndex((a) => a.id === id)
    if (index === -1) {
      throw new Error("Appointment not found")
    }

    mockAppointments.splice(index, 1)
  }

  static async getAvailableSlots(doctorId: string, date: Date): Promise<string[]> {
    await delay(300)

    // Get existing appointments for the doctor on this date
    const existingAppointments = mockAppointments.filter(
      (a) => a.doctorId === doctorId && a.date.toDateString() === date.toDateString(),
    )

    // Generate available slots (9 AM to 5 PM, 30-minute intervals)
    const slots: string[] = []
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

        // Check if this slot is already booked
        const isBooked = existingAppointments.some((a) => {
          const appointmentTime = a.date.toTimeString().slice(0, 5)
          return appointmentTime === timeString
        })

        if (!isBooked) {
          slots.push(timeString)
        }
      }
    }

    return slots
  }
}

// Prescription Service
export class PrescriptionService {
  static async getPrescriptions(filters?: {
    patientId?: string
    status?: string
    pharmacistId?: string
  }): Promise<Prescription[]> {
    await delay(400)

    let prescriptions = [...mockPrescriptions]

    if (filters?.patientId) {
      prescriptions = prescriptions.filter((p) => p.patientId === filters.patientId)
    }

    if (filters?.status) {
      prescriptions = prescriptions.filter((p) => p.status === filters.status)
    }

    if (filters?.pharmacistId) {
      prescriptions = prescriptions.filter((p) => p.pharmacistId === filters.pharmacistId)
    }

    return prescriptions.sort((a, b) => b.prescribedDate.getTime() - a.prescribedDate.getTime())
  }

  static async updatePrescriptionStatus(id: string, status: string, pharmacistId?: string): Promise<Prescription> {
    await delay(500)

    const index = mockPrescriptions.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error("Prescription not found")
    }

    const updates: Partial<Prescription> = {
      status,
      updatedAt: new Date(),
    }

    if (status === "filled" && pharmacistId) {
      updates.pharmacistId = pharmacistId
      updates.pharmacistName = mockUsers.find((u) => u.id === pharmacistId)?.name
      updates.filledDate = new Date()
    }

    mockPrescriptions[index] = {
      ...mockPrescriptions[index],
      ...updates,
    }

    return mockPrescriptions[index]
  }
}

// Inventory Service
export class InventoryService {
  static async getInventory(filters?: {
    status?: string
    search?: string
  }): Promise<InventoryItem[]> {
    await delay(400)

    let inventory = [...mockInventory]

    if (filters?.status) {
      inventory = inventory.filter((item) => item.status === filters.status)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      inventory = inventory.filter(
        (item) =>
          item.medicationName.toLowerCase().includes(searchLower) || item.lotNumber.toLowerCase().includes(searchLower),
      )
    }

    return inventory
  }

  static async updateStock(id: string, quantity: number): Promise<InventoryItem> {
    await delay(500)

    const index = mockInventory.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new Error("Inventory item not found")
    }

    mockInventory[index] = {
      ...mockInventory[index],
      currentStock: quantity,
      lastRestocked: new Date(),
      updatedAt: new Date(),
      status: quantity <= mockInventory[index].minStock ? "low-stock" : "in-stock",
    }

    return mockInventory[index]
  }
}

// Dashboard Service
export class DashboardService {
  static async getDashboardStats(userRole: string): Promise<any> {
    await delay(300)

    return mockDashboardStats[userRole as keyof typeof mockDashboardStats] || {}
  }

  static async getRecentActivity(userRole: string): Promise<any[]> {
    await delay(400)

    // Mock recent activity based on role
    const activities = {
      admin: [
        { id: "1", type: "appointment", message: "New appointment scheduled", time: "2 minutes ago" },
        { id: "2", type: "staff", message: "Dr. Smith checked in", time: "15 minutes ago" },
        { id: "3", type: "patient", message: "Patient registration completed", time: "1 hour ago" },
      ],
      doctor: [
        { id: "1", type: "appointment", message: "Next appointment in 15 minutes", time: "now" },
        { id: "2", type: "lab", message: "Lab results available for John Smith", time: "30 minutes ago" },
        { id: "3", type: "prescription", message: "Prescription sent to pharmacy", time: "1 hour ago" },
      ],
      nurse: [
        { id: "1", type: "vitals", message: "Vitals recorded for Room 205", time: "5 minutes ago" },
        { id: "2", type: "medication", message: "Medication administered", time: "20 minutes ago" },
        { id: "3", type: "patient", message: "Patient discharged from Room 203", time: "45 minutes ago" },
      ],
      receptionist: [
        { id: "1", type: "checkin", message: "Patient checked in for 2:30 PM appointment", time: "5 minutes ago" },
        { id: "2", type: "appointment", message: "Appointment rescheduled", time: "25 minutes ago" },
        { id: "3", type: "insurance", message: "Insurance verification completed", time: "1 hour ago" },
      ],
      pharmacist: [
        { id: "1", type: "prescription", message: "Prescription ready for pickup", time: "10 minutes ago" },
        { id: "2", type: "inventory", message: "Low stock alert: Metformin", time: "2 hours ago" },
        { id: "3", type: "prescription", message: "Prescription filled and verified", time: "3 hours ago" },
      ],
      patient: [
        { id: "1", type: "appointment", message: "Appointment confirmed for tomorrow", time: "1 hour ago" },
        { id: "2", type: "prescription", message: "Prescription ready for pickup", time: "2 hours ago" },
        { id: "3", type: "results", message: "Lab results available in portal", time: "1 day ago" },
      ],
    }

    return activities[userRole as keyof typeof activities] || []
  }
}

// Notification Service
export class NotificationService {
  static async getNotifications(userId: string): Promise<any[]> {
    await delay(300)

    // Mock notifications based on user role
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) return []

    const notifications = {
      admin: [
        {
          id: "1",
          title: "System Maintenance",
          message: "Scheduled maintenance tonight at 11 PM",
          type: "info",
          read: false,
        },
        {
          id: "2",
          title: "Staff Meeting",
          message: "Department heads meeting tomorrow at 9 AM",
          type: "reminder",
          read: false,
        },
      ],
      doctor: [
        { id: "1", title: "Lab Results", message: "New lab results for John Smith", type: "urgent", read: false },
        {
          id: "2",
          title: "Appointment Reminder",
          message: "Next appointment in 30 minutes",
          type: "reminder",
          read: true,
        },
      ],
      nurse: [
        {
          id: "1",
          title: "Medication Due",
          message: "Room 205 - Medication due in 15 minutes",
          type: "urgent",
          read: false,
        },
        { id: "2", title: "Shift Change", message: "Night shift starts in 2 hours", type: "info", read: true },
      ],
      receptionist: [
        { id: "1", title: "Patient Waiting", message: "3 patients waiting for check-in", type: "info", read: false },
        { id: "2", title: "Insurance Update", message: "New insurance cards to verify", type: "reminder", read: false },
      ],
      pharmacist: [
        { id: "1", title: "Low Stock Alert", message: "Metformin stock below minimum", type: "warning", read: false },
        { id: "2", title: "Prescription Ready", message: "5 prescriptions ready for pickup", type: "info", read: true },
      ],
      patient: [
        {
          id: "1",
          title: "Appointment Reminder",
          message: "Your appointment is tomorrow at 2:30 PM",
          type: "reminder",
          read: false,
        },
        {
          id: "2",
          title: "Prescription Ready",
          message: "Your prescription is ready for pickup",
          type: "info",
          read: false,
        },
      ],
    }

    return notifications[user.role as keyof typeof notifications] || []
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await delay(200)
    // Mark notification as read
  }
}
