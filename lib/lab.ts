export interface LabTest {
  id: string
  name: string
  category: string
  description: string
  normalRange?: string
  units?: string
  price: number
  duration: string // e.g., "2-4 hours", "1-2 days"
}

export interface LabOrder {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  tests: LabTest[]
  status: "pending" | "collected" | "processing" | "completed" | "cancelled"
  priority: "routine" | "urgent" | "stat"
  orderedAt: Date
  collectedAt?: Date
  completedAt?: Date
  notes?: string
  totalCost: number
}

export interface LabResult {
  id: string
  orderId: string
  testId: string
  testName: string
  value: string
  normalRange?: string
  units?: string
  status: "normal" | "abnormal" | "critical"
  notes?: string
  technician: string
  verifiedBy?: string
  completedAt: Date
}

// Mock lab tests data
export const mockLabTests: LabTest[] = [
  {
    id: "test-1",
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    description: "Measures different components of blood",
    normalRange: "Various ranges",
    price: 45.0,
    duration: "2-4 hours",
  },
  {
    id: "test-2",
    name: "Basic Metabolic Panel",
    category: "Chemistry",
    description: "Tests kidney function, blood sugar, and electrolytes",
    normalRange: "Various ranges",
    price: 65.0,
    duration: "1-2 hours",
  },
  {
    id: "test-3",
    name: "Lipid Panel",
    category: "Chemistry",
    description: "Measures cholesterol and triglycerides",
    normalRange: "Total cholesterol < 200 mg/dL",
    price: 55.0,
    duration: "2-4 hours",
  },
  {
    id: "test-4",
    name: "Thyroid Function Tests",
    category: "Endocrinology",
    description: "Tests thyroid hormone levels",
    normalRange: "TSH: 0.4-4.0 mIU/L",
    price: 85.0,
    duration: "4-6 hours",
  },
  {
    id: "test-5",
    name: "Urinalysis",
    category: "Microbiology",
    description: "Examines urine for various substances",
    normalRange: "Various parameters",
    price: 25.0,
    duration: "1 hour",
  },
]

// Mock lab orders
export const mockLabOrders: LabOrder[] = [
  {
    id: "order-1",
    patientId: "patient-1",
    patientName: "John Smith",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Johnson",
    tests: [mockLabTests[0], mockLabTests[1]],
    status: "completed",
    priority: "routine",
    orderedAt: new Date("2024-01-15T09:00:00"),
    collectedAt: new Date("2024-01-15T10:30:00"),
    completedAt: new Date("2024-01-15T14:00:00"),
    totalCost: 110.0,
  },
  {
    id: "order-2",
    patientId: "patient-2",
    patientName: "Emily Davis",
    doctorId: "doctor-2",
    doctorName: "Dr. Michael Chen",
    tests: [mockLabTests[2], mockLabTests[3]],
    status: "processing",
    priority: "urgent",
    orderedAt: new Date("2024-01-15T11:00:00"),
    collectedAt: new Date("2024-01-15T11:30:00"),
    totalCost: 140.0,
  },
  {
    id: "order-3",
    patientId: "patient-3",
    patientName: "Robert Wilson",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Johnson",
    tests: [mockLabTests[4]],
    status: "pending",
    priority: "routine",
    orderedAt: new Date("2024-01-15T13:00:00"),
    totalCost: 25.0,
  },
]

// Mock lab results
export const mockLabResults: LabResult[] = [
  {
    id: "result-1",
    orderId: "order-1",
    testId: "test-1",
    testName: "Complete Blood Count (CBC)",
    value: "WBC: 7.2, RBC: 4.5, Hgb: 14.2, Hct: 42.1",
    normalRange: "WBC: 4.0-11.0, RBC: 4.2-5.4, Hgb: 12.0-16.0, Hct: 36-46",
    units: "10³/μL, 10⁶/μL, g/dL, %",
    status: "normal",
    technician: "Lab Tech A",
    verifiedBy: "Dr. Lab Director",
    completedAt: new Date("2024-01-15T14:00:00"),
  },
  {
    id: "result-2",
    orderId: "order-1",
    testId: "test-2",
    testName: "Basic Metabolic Panel",
    value: "Glucose: 95, BUN: 18, Creatinine: 1.0, Na: 140, K: 4.2",
    normalRange: "Glucose: 70-100, BUN: 7-20, Creatinine: 0.6-1.2, Na: 136-145, K: 3.5-5.0",
    units: "mg/dL, mg/dL, mg/dL, mEq/L, mEq/L",
    status: "normal",
    technician: "Lab Tech B",
    verifiedBy: "Dr. Lab Director",
    completedAt: new Date("2024-01-15T14:00:00"),
  },
]
