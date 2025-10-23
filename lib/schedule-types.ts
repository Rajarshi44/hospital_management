export interface Doctor {
  id: string
  name: string
  departmentId: string
  departmentName: string
  specialization: string
  email: string
}

export interface Department {
  id: string
  name: string
}

export interface Schedule {
  id: string
  doctorId: string
  doctorName: string
  departmentName: string
  workingDays: string[] // ['monday', 'tuesday', etc.]
  startTime: string // '10:00'
  endTime: string // '14:00'
  slotDuration: number // 15, 30, 45 minutes
  maxPatientsPerSession: number
  consultationMode: "in-person" | "online" | "both"
  roomNumber: string
  validFrom: string // ISO date
  validTo: string // ISO date or 'always'
  status: "active" | "inactive"
  createdAt: string
}

export interface Leave {
  id: string
  doctorId: string
  date: string // ISO date
  note: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface ScheduleFilters {
  doctorId: string
  departmentId: string
  dayOfWeek: string
  status: "all" | "active" | "inactive"
}

export interface ScheduleFormData {
  doctorId: string
  workingDays: string[]
  startTime: string
  endTime: string
  slotDuration: number
  maxPatientsPerSession: number
  consultationMode: "in-person" | "online" | "both"
  roomNumber: string
  validFrom: string
  validTo: string
  status: "active" | "inactive"
}
