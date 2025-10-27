// Mock Data for Appointments Module

import { Appointment, AppointmentStats, TimeSlot, DoctorAvailability } from "./appointments-types"

// Mock Appointments Data
export const mockAppointments: Appointment[] = [
  {
    id: "1",
    appointmentId: "APT001",
    patientId: "P001",
    patientName: "John Doe",
    patientUHID: "UHID001",
    patientPhone: "+1234567890",
    doctorId: "D001",
    doctorName: "Dr. Sarah Johnson",
    departmentId: "cardiology",
    department: "Cardiology",
    date: new Date().toISOString().split('T')[0],
    timeSlot: "10:00 AM - 10:30 AM",
    slot: `${new Date().toLocaleDateString()} 10:00 AM`,
    mode: "Offline",
    status: "Scheduled",
    visitType: "First Visit",
    priority: false,
    consultationFee: 500,
    paymentMode: "Cash",
    paymentStatus: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    appointmentId: "APT002",
    patientId: "P002",
    patientName: "Jane Smith",
    patientUHID: "UHID002",
    patientPhone: "+1234567891",
    doctorId: "D002",
    doctorName: "Dr. Michael Chen",
    departmentId: "orthopedics",
    department: "Orthopedics",
    date: new Date().toISOString().split('T')[0],
    timeSlot: "11:00 AM - 11:30 AM",
    slot: `${new Date().toLocaleDateString()} 11:00 AM`,
    mode: "Tele/Video",
    status: "Checked-in",
    visitType: "Follow-Up",
    priority: false,
    consultationFee: 600,
    paymentMode: "UPI",
    paymentStatus: "Paid",
    checkedInAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    appointmentId: "APT003",
    patientId: "P003",
    patientName: "Robert Brown",
    patientUHID: "UHID003",
    patientPhone: "+1234567892",
    doctorId: "D003",
    doctorName: "Dr. Emily Davis",
    departmentId: "neurology",
    department: "Neurology",
    date: new Date().toISOString().split('T')[0],
    timeSlot: "02:00 PM - 02:30 PM",
    slot: `${new Date().toLocaleDateString()} 02:00 PM`,
    mode: "Offline",
    status: "In Progress",
    visitType: "Review",
    priority: true,
    consultationFee: 800,
    paymentMode: "Card",
    paymentStatus: "Paid",
    notes: "Patient experiencing severe headaches",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    appointmentId: "APT004",
    patientId: "P004",
    patientName: "Alice Johnson",
    patientUHID: "UHID004",
    patientPhone: "+1234567893",
    doctorId: "D001",
    doctorName: "Dr. Sarah Johnson",
    departmentId: "cardiology",
    department: "Cardiology",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    timeSlot: "03:00 PM - 03:30 PM",
    slot: `${new Date(Date.now() - 86400000).toLocaleDateString()} 03:00 PM`,
    mode: "Offline",
    status: "Completed",
    visitType: "Follow-Up",
    priority: false,
    consultationFee: 500,
    paymentMode: "Cash",
    paymentStatus: "Paid",
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "5",
    appointmentId: "APT005",
    patientId: "P005",
    patientName: "David Wilson",
    patientUHID: "UHID005",
    patientPhone: "+1234567894",
    doctorId: "D004",
    doctorName: "Dr. James Martinez",
    departmentId: "pediatrics",
    department: "Pediatrics",
    date: new Date().toISOString().split('T')[0],
    timeSlot: "04:00 PM - 04:30 PM",
    slot: `${new Date().toLocaleDateString()} 04:00 PM`,
    mode: "Offline",
    status: "Cancelled",
    visitType: "First Visit",
    priority: false,
    consultationFee: 400,
    cancelledAt: new Date().toISOString(),
    cancellationReason: "Patient requested cancellation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock Stats Calculation
export function getAppointmentStats(appointments: Appointment[]): AppointmentStats {
  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(apt => apt.date === today)
  
  return {
    todayAppointments: todayAppts.length,
    pending: todayAppts.filter(apt => apt.status === "Scheduled" || apt.status === "Checked-in").length,
    completed: todayAppts.filter(apt => apt.status === "Completed").length,
    cancelled: todayAppts.filter(apt => apt.status === "Cancelled").length,
  }
}

// Mock Time Slots Generation
export function generateTimeSlots(doctorId: string, date: string): TimeSlot[] {
  const slots: TimeSlot[] = []
  const times = [
    { start: "09:00", end: "09:30", time: "09:00 AM" },
    { start: "09:30", end: "10:00", time: "09:30 AM" },
    { start: "10:00", end: "10:30", time: "10:00 AM" },
    { start: "10:30", end: "11:00", time: "10:30 AM" },
    { start: "11:00", end: "11:30", time: "11:00 AM" },
    { start: "11:30", end: "12:00", time: "11:30 AM" },
    { start: "02:00", end: "02:30", time: "02:00 PM" },
    { start: "02:30", end: "03:00", time: "02:30 PM" },
    { start: "03:00", end: "03:30", time: "03:00 PM" },
    { start: "03:30", end: "04:00", time: "03:30 PM" },
    { start: "04:00", end: "04:30", time: "04:00 PM" },
    { start: "04:30", end: "05:00", time: "04:30 PM" },
  ]

  times.forEach((t, index) => {
    const booked = Math.floor(Math.random() * 3) // Random 0-2 bookings
    slots.push({
      id: `slot-${index}`,
      time: t.time,
      startTime: t.start,
      endTime: t.end,
      available: booked < 2,
      booked,
      capacity: 2,
      doctorId,
    })
  })

  return slots
}

// Mock Doctor Availability
export function getDoctorAvailability(doctorId: string, date: string): DoctorAvailability {
  return {
    doctorId,
    date,
    slots: generateTimeSlots(doctorId, date),
  }
}

// Filter Appointments
export function filterAppointments(
  appointments: Appointment[],
  filters: {
    patientSearch?: string
    doctorId?: string
    departmentId?: string
    dateFrom?: string
    dateTo?: string
    status?: string
    mode?: string
  }
): Appointment[] {
  return appointments.filter(apt => {
    if (filters.patientSearch) {
      const search = filters.patientSearch.toLowerCase()
      if (
        !apt.patientName.toLowerCase().includes(search) &&
        !apt.patientUHID.toLowerCase().includes(search) &&
        !apt.patientPhone.includes(search)
      ) {
        return false
      }
    }
    
    if (filters.doctorId && apt.doctorId !== filters.doctorId) return false
    if (filters.departmentId && apt.departmentId !== filters.departmentId) return false
    if (filters.status && apt.status !== filters.status) return false
    if (filters.mode && apt.mode !== filters.mode) return false
    
    if (filters.dateFrom && apt.date < filters.dateFrom) return false
    if (filters.dateTo && apt.date > filters.dateTo) return false
    
    return true
  })
}

// Create Mock Appointment
export function createMockAppointment(data: Partial<Appointment>): Appointment {
  const id = `APT${String(mockAppointments.length + 1).padStart(3, '0')}`
  return {
    id: String(mockAppointments.length + 1),
    appointmentId: id,
    patientId: data.patientId || "",
    patientName: data.patientName || "",
    patientUHID: data.patientUHID || "",
    patientPhone: data.patientPhone || "",
    doctorId: data.doctorId || "",
    doctorName: data.doctorName || "",
    departmentId: data.departmentId || "",
    department: data.department || "",
    date: data.date || new Date().toISOString().split('T')[0],
    timeSlot: data.timeSlot || "",
    slot: data.slot || "",
    mode: data.mode || "Offline",
    status: data.status || "Scheduled",
    visitType: data.visitType || "First Visit",
    priority: data.priority || false,
    consultationFee: data.consultationFee || 500,
    notes: data.notes,
    paymentMode: data.paymentMode,
    paymentStatus: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
