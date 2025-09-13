export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  date: Date
  startTime: string
  endTime: string
  duration: number // in minutes
  type: "consultation" | "follow-up" | "procedure" | "emergency"
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show"
  department: string
  room?: string
  notes?: string
  symptoms?: string
  priority: "low" | "medium" | "high" | "urgent"
}

export interface TimeSlot {
  time: string
  available: boolean
  appointmentId?: string
}

export interface Doctor {
  id: string
  name: string
  specialization: string
  department: string
  avatar?: string
}

// Mock data
export const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    department: "Cardiology",
    avatar: "/placeholder.svg?key=doc1",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialization: "Pediatrics",
    department: "Pediatrics",
    avatar: "/placeholder.svg?key=doc2",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialization: "Emergency Medicine",
    department: "Emergency",
    avatar: "/placeholder.svg?key=doc3",
  },
  {
    id: "4",
    name: "Dr. David Park",
    specialization: "Orthopedics",
    department: "Orthopedics",
    avatar: "/placeholder.svg?key=doc4",
  },
]

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "p1",
    patientName: "John Doe",
    doctorId: "1",
    doctorName: "Dr. Sarah Johnson",
    date: new Date(2024, 11, 15),
    startTime: "09:00",
    endTime: "09:30",
    duration: 30,
    type: "consultation",
    status: "scheduled",
    department: "Cardiology",
    room: "Room 201",
    priority: "medium",
    symptoms: "Chest pain, shortness of breath",
  },
  {
    id: "2",
    patientId: "p2",
    patientName: "Sarah Smith",
    doctorId: "2",
    doctorName: "Dr. Michael Chen",
    date: new Date(2024, 11, 15),
    startTime: "10:00",
    endTime: "10:30",
    duration: 30,
    type: "follow-up",
    status: "confirmed",
    department: "Pediatrics",
    room: "Room 105",
    priority: "low",
    notes: "Follow-up for vaccination",
  },
  {
    id: "3",
    patientId: "p3",
    patientName: "Mike Johnson",
    doctorId: "3",
    doctorName: "Dr. Emily Rodriguez",
    date: new Date(2024, 11, 15),
    startTime: "14:00",
    endTime: "14:45",
    duration: 45,
    type: "emergency",
    status: "in-progress",
    department: "Emergency",
    room: "ER-3",
    priority: "urgent",
    symptoms: "Severe abdominal pain",
  },
]

export const generateTimeSlots = (date: Date, doctorId: string): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const startHour = 9
  const endHour = 17
  const slotDuration = 30 // minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const appointment = mockAppointments.find(
        (apt) => apt.doctorId === doctorId && apt.date.toDateString() === date.toDateString() && apt.startTime === time,
      )

      slots.push({
        time,
        available: !appointment,
        appointmentId: appointment?.id,
      })
    }
  }

  return slots
}

export const getAppointmentsByDate = (date: Date): Appointment[] => {
  return mockAppointments.filter((apt) => apt.date.toDateString() === date.toDateString())
}

export const getAppointmentsByDoctor = (doctorId: string, date?: Date): Appointment[] => {
  let appointments = mockAppointments.filter((apt) => apt.doctorId === doctorId)

  if (date) {
    appointments = appointments.filter((apt) => apt.date.toDateString() === date.toDateString())
  }

  return appointments
}
