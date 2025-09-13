export interface Medication {
  id: string
  name: string
  genericName?: string
  brand: string
  category: "antibiotic" | "pain-relief" | "cardiovascular" | "diabetes" | "respiratory" | "other"
  form: "tablet" | "capsule" | "liquid" | "injection" | "cream" | "inhaler"
  strength: string
  unit: string
  description?: string
  sideEffects?: string[]
  contraindications?: string[]
  requiresPrescription: boolean
}

export interface InventoryItem {
  id: string
  medicationId: string
  medication: Medication
  batchNumber: string
  expiryDate: Date
  manufacturer: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unitCost: number
  location: string
  status: "available" | "low-stock" | "out-of-stock" | "expired" | "recalled"
  lastRestocked: Date
  supplier: string
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  medicationId: string
  medication: Medication
  dosage: string
  frequency: string
  duration: string
  quantity: number
  refills: number
  refillsUsed: number
  instructions: string
  prescribedDate: Date
  status: "pending" | "filled" | "partially-filled" | "ready" | "dispensed" | "cancelled"
  priority: "routine" | "urgent" | "stat"
  notes?: string
  pharmacistId?: string
  pharmacistName?: string
  dispensedDate?: Date
}

export interface PharmacyOrder {
  id: string
  supplierId: string
  supplierName: string
  orderDate: Date
  expectedDelivery: Date
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  items: Array<{
    medicationId: string
    medicationName: string
    quantity: number
    unitCost: number
    totalCost: number
  }>
  totalAmount: number
  orderNumber: string
}

// Mock data
export const mockMedications: Medication[] = [
  {
    id: "med1",
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    brand: "Amoxil",
    category: "antibiotic",
    form: "capsule",
    strength: "500",
    unit: "mg",
    description: "Broad-spectrum antibiotic used to treat bacterial infections",
    sideEffects: ["Nausea", "Diarrhea", "Stomach upset"],
    contraindications: ["Penicillin allergy"],
    requiresPrescription: true,
  },
  {
    id: "med2",
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    brand: "Advil",
    category: "pain-relief",
    form: "tablet",
    strength: "200",
    unit: "mg",
    description: "Nonsteroidal anti-inflammatory drug (NSAID) for pain and inflammation",
    sideEffects: ["Stomach irritation", "Dizziness", "Headache"],
    contraindications: ["Stomach ulcers", "Kidney disease"],
    requiresPrescription: false,
  },
  {
    id: "med3",
    name: "Lisinopril",
    genericName: "Lisinopril",
    brand: "Prinivil",
    category: "cardiovascular",
    form: "tablet",
    strength: "10",
    unit: "mg",
    description: "ACE inhibitor used to treat high blood pressure and heart failure",
    sideEffects: ["Dry cough", "Dizziness", "Fatigue"],
    contraindications: ["Pregnancy", "Angioedema history"],
    requiresPrescription: true,
  },
  {
    id: "med4",
    name: "Metformin",
    genericName: "Metformin",
    brand: "Glucophage",
    category: "diabetes",
    form: "tablet",
    strength: "500",
    unit: "mg",
    description: "Medication used to treat type 2 diabetes",
    sideEffects: ["Nausea", "Diarrhea", "Metallic taste"],
    contraindications: ["Kidney disease", "Liver disease"],
    requiresPrescription: true,
  },
  {
    id: "med5",
    name: "Albuterol",
    genericName: "Albuterol",
    brand: "Ventolin",
    category: "respiratory",
    form: "inhaler",
    strength: "90",
    unit: "mcg",
    description: "Bronchodilator used to treat asthma and COPD",
    sideEffects: ["Tremor", "Nervousness", "Headache"],
    contraindications: ["Heart rhythm disorders"],
    requiresPrescription: true,
  },
]

export const mockInventory: InventoryItem[] = [
  {
    id: "inv1",
    medicationId: "med1",
    medication: mockMedications[0],
    batchNumber: "AMX2024001",
    expiryDate: new Date(2025, 5, 15),
    manufacturer: "Pfizer",
    currentStock: 45,
    minimumStock: 50,
    maximumStock: 200,
    unitCost: 0.85,
    location: "A-1-01",
    status: "low-stock",
    lastRestocked: new Date(2024, 9, 1),
    supplier: "MedSupply Co.",
  },
  {
    id: "inv2",
    medicationId: "med2",
    medication: mockMedications[1],
    batchNumber: "IBU2024002",
    expiryDate: new Date(2026, 2, 20),
    manufacturer: "Johnson & Johnson",
    currentStock: 120,
    minimumStock: 100,
    maximumStock: 300,
    unitCost: 0.15,
    location: "B-2-03",
    status: "available",
    lastRestocked: new Date(2024, 10, 15),
    supplier: "PharmaCorp",
  },
  {
    id: "inv3",
    medicationId: "med3",
    medication: mockMedications[2],
    batchNumber: "LIS2024003",
    expiryDate: new Date(2025, 8, 10),
    manufacturer: "Merck",
    currentStock: 8,
    minimumStock: 20,
    maximumStock: 100,
    unitCost: 1.25,
    location: "C-1-05",
    status: "low-stock",
    lastRestocked: new Date(2024, 8, 20),
    supplier: "MedSupply Co.",
  },
  {
    id: "inv4",
    medicationId: "med4",
    medication: mockMedications[3],
    batchNumber: "MET2024004",
    expiryDate: new Date(2025, 11, 30),
    manufacturer: "Bristol Myers Squibb",
    currentStock: 0,
    minimumStock: 30,
    maximumStock: 150,
    unitCost: 0.95,
    location: "D-3-02",
    status: "out-of-stock",
    lastRestocked: new Date(2024, 7, 10),
    supplier: "PharmaCorp",
  },
  {
    id: "inv5",
    medicationId: "med5",
    medication: mockMedications[4],
    batchNumber: "ALB2024005",
    expiryDate: new Date(2025, 3, 5),
    manufacturer: "GlaxoSmithKline",
    currentStock: 25,
    minimumStock: 15,
    maximumStock: 75,
    unitCost: 12.5,
    location: "E-1-08",
    status: "available",
    lastRestocked: new Date(2024, 10, 5),
    supplier: "Respiratory Meds Inc.",
  },
]

export const mockPrescriptions: Prescription[] = [
  {
    id: "rx1",
    patientId: "p1",
    patientName: "John Doe",
    doctorId: "1",
    doctorName: "Dr. Sarah Johnson",
    medicationId: "med3",
    medication: mockMedications[2],
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    quantity: 30,
    refills: 2,
    refillsUsed: 0,
    instructions: "Take with food. Monitor blood pressure regularly.",
    prescribedDate: new Date(2024, 10, 1),
    status: "pending",
    priority: "routine",
    notes: "Patient has history of hypertension",
  },
  {
    id: "rx2",
    patientId: "p2",
    patientName: "Sarah Smith",
    doctorId: "2",
    doctorName: "Dr. Michael Chen",
    medicationId: "med2",
    medication: mockMedications[1],
    dosage: "200mg",
    frequency: "Every 6 hours as needed",
    duration: "7 days",
    quantity: 28,
    refills: 0,
    refillsUsed: 0,
    instructions: "Take with food to reduce stomach irritation.",
    prescribedDate: new Date(2024, 10, 2),
    status: "filled",
    priority: "routine",
    pharmacistId: "ph1",
    pharmacistName: "Dr. Lisa Chen",
    dispensedDate: new Date(2024, 10, 2),
  },
  {
    id: "rx3",
    patientId: "p3",
    patientName: "Mike Johnson",
    doctorId: "3",
    doctorName: "Dr. Emily Rodriguez",
    medicationId: "med1",
    medication: mockMedications[0],
    dosage: "500mg",
    frequency: "Three times daily",
    duration: "10 days",
    quantity: 30,
    refills: 0,
    refillsUsed: 0,
    instructions: "Complete full course even if feeling better.",
    prescribedDate: new Date(2024, 10, 3),
    status: "ready",
    priority: "urgent",
    pharmacistId: "ph1",
    pharmacistName: "Dr. Lisa Chen",
  },
]

export const searchMedications = (query: string): Medication[] => {
  if (!query.trim()) return mockMedications

  const lowercaseQuery = query.toLowerCase()
  return mockMedications.filter(
    (med) =>
      med.name.toLowerCase().includes(lowercaseQuery) ||
      med.genericName?.toLowerCase().includes(lowercaseQuery) ||
      med.brand.toLowerCase().includes(lowercaseQuery) ||
      med.category.toLowerCase().includes(lowercaseQuery),
  )
}

export const getInventoryAlerts = (): InventoryItem[] => {
  return mockInventory.filter((item) => item.status === "low-stock" || item.status === "out-of-stock")
}

export const getExpiringMedications = (days = 30): InventoryItem[] => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() + days)

  return mockInventory.filter((item) => item.expiryDate <= cutoffDate && item.currentStock > 0)
}

export const getPrescriptionsByStatus = (status: Prescription["status"]): Prescription[] => {
  return mockPrescriptions.filter((rx) => rx.status === status)
}
