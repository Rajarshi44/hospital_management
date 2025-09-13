export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: "male" | "female" | "other"
  phone: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  insurance: {
    provider: string
    policyNumber: string
    groupNumber?: string
  }
  medicalHistory: MedicalRecord[]
  allergies: string[]
  medications: Medication[]
  bloodType: string
  height: string
  weight: string
  status: "active" | "inactive" | "deceased"
  registrationDate: Date
  lastVisit?: Date
  assignedDoctor?: string
}

export interface MedicalRecord {
  id: string
  date: Date
  type: "diagnosis" | "treatment" | "lab-result" | "prescription" | "note"
  title: string
  description: string
  doctorId: string
  doctorName: string
  attachments?: string[]
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: Date
  endDate?: Date
  prescribedBy: string
  status: "active" | "completed" | "discontinued"
}

export interface VitalSigns {
  id: string
  patientId: string
  date: Date
  bloodPressure: {
    systolic: number
    diastolic: number
  }
  heartRate: number
  temperature: number
  respiratoryRate: number
  oxygenSaturation: number
  weight?: number
  height?: number
  recordedBy: string
}

// Mock data
export const mockPatients: Patient[] = [
  {
    id: "p1",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Date(1985, 5, 15),
    gender: "male",
    phone: "(555) 123-4567",
    email: "john.doe@email.com",
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "(555) 123-4568",
    },
    insurance: {
      provider: "Blue Cross Blue Shield",
      policyNumber: "BC123456789",
      groupNumber: "GRP001",
    },
    medicalHistory: [
      {
        id: "mr1",
        date: new Date(2024, 10, 1),
        type: "diagnosis",
        title: "Hypertension",
        description: "Diagnosed with stage 1 hypertension. Blood pressure consistently elevated.",
        doctorId: "1",
        doctorName: "Dr. Sarah Johnson",
      },
      {
        id: "mr2",
        date: new Date(2024, 9, 15),
        type: "lab-result",
        title: "Blood Work",
        description: "Complete blood count and lipid panel. Cholesterol slightly elevated.",
        doctorId: "1",
        doctorName: "Dr. Sarah Johnson",
      },
    ],
    allergies: ["Penicillin", "Shellfish"],
    medications: [
      {
        id: "med1",
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        startDate: new Date(2024, 10, 1),
        prescribedBy: "Dr. Sarah Johnson",
        status: "active",
      },
    ],
    bloodType: "A+",
    height: "5'10\"",
    weight: "180 lbs",
    status: "active",
    registrationDate: new Date(2023, 2, 10),
    lastVisit: new Date(2024, 10, 1),
    assignedDoctor: "Dr. Sarah Johnson",
  },
  {
    id: "p2",
    firstName: "Sarah",
    lastName: "Smith",
    dateOfBirth: new Date(1992, 8, 22),
    gender: "female",
    phone: "(555) 234-5678",
    email: "sarah.smith@email.com",
    address: {
      street: "456 Oak Ave",
      city: "Springfield",
      state: "IL",
      zipCode: "62702",
    },
    emergencyContact: {
      name: "Michael Smith",
      relationship: "Brother",
      phone: "(555) 234-5679",
    },
    insurance: {
      provider: "Aetna",
      policyNumber: "AET987654321",
    },
    medicalHistory: [
      {
        id: "mr3",
        date: new Date(2024, 9, 20),
        type: "diagnosis",
        title: "Seasonal Allergies",
        description: "Diagnosed with seasonal allergic rhinitis. Symptoms include sneezing and congestion.",
        doctorId: "2",
        doctorName: "Dr. Michael Chen",
      },
    ],
    allergies: ["Pollen", "Dust mites"],
    medications: [
      {
        id: "med2",
        name: "Claritin",
        dosage: "10mg",
        frequency: "Once daily as needed",
        startDate: new Date(2024, 9, 20),
        prescribedBy: "Dr. Michael Chen",
        status: "active",
      },
    ],
    bloodType: "O-",
    height: "5'6\"",
    weight: "135 lbs",
    status: "active",
    registrationDate: new Date(2023, 7, 5),
    lastVisit: new Date(2024, 9, 20),
    assignedDoctor: "Dr. Michael Chen",
  },
  {
    id: "p3",
    firstName: "Mike",
    lastName: "Johnson",
    dateOfBirth: new Date(1978, 11, 3),
    gender: "male",
    phone: "(555) 345-6789",
    email: "mike.johnson@email.com",
    address: {
      street: "789 Pine St",
      city: "Springfield",
      state: "IL",
      zipCode: "62703",
    },
    emergencyContact: {
      name: "Lisa Johnson",
      relationship: "Wife",
      phone: "(555) 345-6790",
    },
    insurance: {
      provider: "United Healthcare",
      policyNumber: "UHC456789123",
    },
    medicalHistory: [
      {
        id: "mr4",
        date: new Date(2024, 8, 10),
        type: "treatment",
        title: "Physical Therapy",
        description: "Completed 6 weeks of physical therapy for lower back pain.",
        doctorId: "4",
        doctorName: "Dr. David Park",
      },
    ],
    allergies: [],
    medications: [],
    bloodType: "B+",
    height: "6'1\"",
    weight: "195 lbs",
    status: "active",
    registrationDate: new Date(2022, 11, 15),
    lastVisit: new Date(2024, 8, 10),
    assignedDoctor: "Dr. David Park",
  },
]

export const mockVitalSigns: VitalSigns[] = [
  {
    id: "v1",
    patientId: "p1",
    date: new Date(2024, 10, 1),
    bloodPressure: { systolic: 140, diastolic: 90 },
    heartRate: 72,
    temperature: 98.6,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 180,
    recordedBy: "Nurse Emily",
  },
  {
    id: "v2",
    patientId: "p2",
    date: new Date(2024, 9, 20),
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 68,
    temperature: 98.4,
    respiratoryRate: 14,
    oxygenSaturation: 99,
    weight: 135,
    recordedBy: "Nurse Emily",
  },
]

export const searchPatients = (query: string): Patient[] => {
  if (!query.trim()) return mockPatients

  const lowercaseQuery = query.toLowerCase()
  return mockPatients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(lowercaseQuery) ||
      patient.lastName.toLowerCase().includes(lowercaseQuery) ||
      patient.email.toLowerCase().includes(lowercaseQuery) ||
      patient.phone.includes(query) ||
      patient.id.toLowerCase().includes(lowercaseQuery),
  )
}

export const getPatientById = (id: string): Patient | undefined => {
  return mockPatients.find((patient) => patient.id === id)
}

export const getPatientVitals = (patientId: string): VitalSigns[] => {
  return mockVitalSigns.filter((vital) => vital.patientId === patientId)
}
