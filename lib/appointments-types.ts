// Appointments Module Type Definitions

export type AppointmentStatus = "Scheduled" | "Checked-in" | "In Progress" | "Completed" | "Cancelled"
export type AppointmentMode = "Offline" | "Tele/Video"
export type VisitType = "First Visit" | "Follow-Up" | "Review"
export type PaymentMode = "Cash" | "UPI" | "Card" | "Online" | "Insurance"

export interface Appointment {
  id: string
  appointmentId: string
  patientId: string
  patientName: string
  patientUHID: string
  patientPhone: string
  doctorId: string
  doctorName: string
  departmentId: string
  department: string
  date: string
  timeSlot: string
  slot: string // Combined date & time for display
  mode: AppointmentMode
  status: AppointmentStatus
  visitType: VisitType
  priority: boolean
  notes?: string
  consultationFee: number
  paymentMode?: PaymentMode
  paymentStatus?: "Paid" | "Pending" | "Refunded"
  checkedInAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentStats {
  todayAppointments: number
  pending: number
  completed: number
  cancelled: number
}

export interface AppointmentFilters {
  patientSearch?: string
  doctorId?: string
  departmentId?: string
  dateFrom?: string
  dateTo?: string
  status?: AppointmentStatus
  mode?: AppointmentMode
}

export interface TimeSlot {
  id: string
  time: string
  startTime: string
  endTime: string
  available: boolean
  booked: number
  capacity: number
  doctorId: string
}

export interface DoctorAvailability {
  doctorId: string
  date: string
  slots: TimeSlot[]
}

export interface BookAppointmentFormData {
  // Patient
  patientId?: string
  patientName?: string
  patientPhone?: string
  patientUHID?: string
  isNewPatient?: boolean
  
  // Doctor & Department
  doctorId: string
  departmentId: string
  visitType: VisitType
  
  // Slot & Mode
  mode: AppointmentMode
  appointmentDate: string
  timeSlot: string
  
  // Additional
  priority: boolean
  sendSMS: boolean
  sendWhatsApp: boolean
  notes?: string
  
  // Payment
  consultationFee: number
  paymentMode: PaymentMode
}

export interface QuickPatientFormData {
  fullName: string
  phone: string
  age: number
  gender: "Male" | "Female" | "Other"
  email?: string
}
