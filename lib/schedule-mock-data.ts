import { Doctor, Department, Schedule, Leave } from './schedule-types'

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    departmentId: '1',
    departmentName: 'Cardiology',
    specialization: 'Interventional Cardiology',
    email: 'sarah.johnson@hospital.com'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    departmentId: '2',
    departmentName: 'Neurology',
    specialization: 'Neurosurgery',
    email: 'michael.chen@hospital.com'
  },
  {
    id: '3',
    name: 'Dr. Emily Davis',
    departmentId: '3',
    departmentName: 'Pediatrics',
    specialization: 'Pediatric Emergency',
    email: 'emily.davis@hospital.com'
  },
  {
    id: '4',
    name: 'Dr. Robert Smith',
    departmentId: '4',
    departmentName: 'Orthopedics',
    specialization: 'Spine Surgery',
    email: 'robert.smith@hospital.com'
  },
  {
    id: '5',
    name: 'Dr. Lisa Wang',
    departmentId: '1',
    departmentName: 'Cardiology',
    specialization: 'Pediatric Cardiology',
    email: 'lisa.wang@hospital.com'
  },
  {
    id: '6',
    name: 'Dr. James Wilson',
    departmentId: '5',
    departmentName: 'Emergency Medicine',
    specialization: 'Trauma Surgery',
    email: 'james.wilson@hospital.com'
  }
]

export const mockDepartments: Department[] = [
  { id: '1', name: 'Cardiology' },
  { id: '2', name: 'Neurology' },
  { id: '3', name: 'Pediatrics' },
  { id: '4', name: 'Orthopedics' },
  { id: '5', name: 'Emergency Medicine' },
  { id: '6', name: 'Dermatology' },
  { id: '7', name: 'Gastroenterology' }
]

export const mockSchedules: Schedule[] = [
  {
    id: '1',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    departmentName: 'Cardiology',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '13:00',
    slotDuration: 30,
    maxPatientsPerSession: 15,
    consultationMode: 'both',
    roomNumber: 'C-101',
    validFrom: '2025-01-01',
    validTo: 'always',
    status: 'active',
    createdAt: '2025-10-01T10:00:00Z'
  },
  {
    id: '2',
    doctorId: '2',
    doctorName: 'Dr. Michael Chen',
    departmentName: 'Neurology',
    workingDays: ['monday', 'wednesday', 'friday'],
    startTime: '14:00',
    endTime: '18:00',
    slotDuration: 45,
    maxPatientsPerSession: 10,
    consultationMode: 'in-person',
    roomNumber: 'N-205',
    validFrom: '2025-01-01',
    validTo: 'always',
    status: 'active',
    createdAt: '2025-10-01T10:00:00Z'
  },
  {
    id: '3',
    doctorId: '3',
    doctorName: 'Dr. Emily Davis',
    departmentName: 'Pediatrics',
    workingDays: ['tuesday', 'thursday', 'saturday'],
    startTime: '10:00',
    endTime: '14:00',
    slotDuration: 20,
    maxPatientsPerSession: 20,
    consultationMode: 'both',
    roomNumber: 'P-102',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    status: 'active',
    createdAt: '2025-10-01T10:00:00Z'
  },
  {
    id: '4',
    doctorId: '4',
    doctorName: 'Dr. Robert Smith',
    departmentName: 'Orthopedics',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday'],
    startTime: '08:30',
    endTime: '12:30',
    slotDuration: 30,
    maxPatientsPerSession: 12,
    consultationMode: 'in-person',
    roomNumber: 'O-301',
    validFrom: '2025-01-01',
    validTo: 'always',
    status: 'inactive',
    createdAt: '2025-10-01T10:00:00Z'
  }
]

export const mockLeaves: Leave[] = [
  {
    id: '1',
    doctorId: '1',
    date: '2025-10-25',
    note: 'Medical Conference'
  },
  {
    id: '2', 
    doctorId: '2',
    date: '2025-10-30',
    note: 'Personal Leave'
  }
]

export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' }
]

export const SLOT_DURATIONS = [
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' }
]

export const CONSULTATION_MODES = [
  { value: 'in-person', label: 'In-person' },
  { value: 'online', label: 'Online' },
  { value: 'both', label: 'Both' }
]