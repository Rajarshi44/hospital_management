export interface BillingItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category: "consultation" | "procedure" | "medication" | "lab" | "room" | "other"
}

export interface Invoice {
  id: string
  invoiceNumber: string
  patientId: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  patientAddress?: string
  doctorId?: string
  doctorName?: string
  items: BillingItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  paymentMethod?: "cash" | "card" | "insurance" | "bank_transfer"
  createdAt: Date
  dueDate: Date
  paidAt?: Date
  notes?: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: "cash" | "card" | "insurance" | "bank_transfer"
  reference?: string
  paidAt: Date
  notes?: string
}

// Mock billing data
export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2024-001",
    patientId: "patient-1",
    patientName: "John Smith",
    patientEmail: "john.smith@email.com",
    patientPhone: "+1 (555) 123-4567",
    patientAddress: "123 Main St, City, State 12345",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Johnson",
    items: [
      {
        id: "item-1",
        description: "General Consultation",
        quantity: 1,
        unitPrice: 150.0,
        total: 150.0,
        category: "consultation",
      },
      {
        id: "item-2",
        description: "Blood Test - CBC",
        quantity: 1,
        unitPrice: 45.0,
        total: 45.0,
        category: "lab",
      },
      {
        id: "item-3",
        description: "Prescription Medication",
        quantity: 2,
        unitPrice: 25.0,
        total: 50.0,
        category: "medication",
      },
    ],
    subtotal: 245.0,
    tax: 24.5,
    discount: 0,
    total: 269.5,
    status: "paid",
    paymentMethod: "card",
    createdAt: new Date("2024-01-15T10:00:00"),
    dueDate: new Date("2024-01-30T23:59:59"),
    paidAt: new Date("2024-01-16T14:30:00"),
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2024-002",
    patientId: "patient-2",
    patientName: "Emily Davis",
    patientEmail: "emily.davis@email.com",
    patientPhone: "+1 (555) 987-6543",
    doctorId: "doctor-2",
    doctorName: "Dr. Michael Chen",
    items: [
      {
        id: "item-4",
        description: "Specialist Consultation",
        quantity: 1,
        unitPrice: 200.0,
        total: 200.0,
        category: "consultation",
      },
      {
        id: "item-5",
        description: "X-Ray Examination",
        quantity: 1,
        unitPrice: 120.0,
        total: 120.0,
        category: "procedure",
      },
    ],
    subtotal: 320.0,
    tax: 32.0,
    discount: 20.0,
    total: 332.0,
    status: "sent",
    createdAt: new Date("2024-01-16T09:00:00"),
    dueDate: new Date("2024-01-31T23:59:59"),
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2024-003",
    patientId: "patient-3",
    patientName: "Robert Wilson",
    patientEmail: "robert.wilson@email.com",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Johnson",
    items: [
      {
        id: "item-6",
        description: "Emergency Room Visit",
        quantity: 1,
        unitPrice: 500.0,
        total: 500.0,
        category: "consultation",
      },
      {
        id: "item-7",
        description: "Room Charge (1 night)",
        quantity: 1,
        unitPrice: 300.0,
        total: 300.0,
        category: "room",
      },
    ],
    subtotal: 800.0,
    tax: 80.0,
    discount: 0,
    total: 880.0,
    status: "overdue",
    createdAt: new Date("2024-01-10T15:00:00"),
    dueDate: new Date("2024-01-25T23:59:59"),
  },
]

export const mockPayments: Payment[] = [
  {
    id: "pay-1",
    invoiceId: "inv-1",
    amount: 269.5,
    method: "card",
    reference: "CARD-****1234",
    paidAt: new Date("2024-01-16T14:30:00"),
    notes: "Payment processed successfully",
  },
]

// Service categories for billing
export const serviceCategories = [
  { value: "consultation", label: "Consultation", color: "bg-blue-50 text-blue-700" },
  { value: "procedure", label: "Procedure", color: "bg-green-50 text-green-700" },
  { value: "medication", label: "Medication", color: "bg-purple-50 text-purple-700" },
  { value: "lab", label: "Laboratory", color: "bg-orange-50 text-orange-700" },
  { value: "room", label: "Room Charge", color: "bg-pink-50 text-pink-700" },
  { value: "other", label: "Other", color: "bg-gray-50 text-gray-700" },
]
