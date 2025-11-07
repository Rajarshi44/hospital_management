// Lab Management Types and Interfaces

export enum LabOrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  NURSE = 'NURSE',
}

export interface LabTest {
  id: string;
  name: string;
  code: string;
  category: string;
  department: string; // Department code (e.g., "HEMA", "BIOC")
  description?: string;
  methodology?: string;
  sampleType?: string;
  price: number;
  normalRange?: string;
  unit?: string;
  duration?: string;
  sampleVolume?: string;
  fasting?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabOrder {
  id: string;
  // `orderId` is the human-friendly lab order code (e.g. LAB000001)
  orderId?: string;
  patientId: string;
  doctorId: string;
  status: LabOrderStatus;
  priority: Priority;
  clinicalNotes?: string;
  requestedBy?: string;
  totalAmount: number;
  // orderedAt is the date/time the order was placed in the system
  orderedAt?: string | Date;
  createdAt: Date;
  updatedAt: Date;
  tests?: LabOrderTest[];
  results?: LabResult[];
  // Enriched data from backend
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    patientId: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: Date;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  collector?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  processor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  report?: string;
  reportContent?: string;
}

export interface LabOrderTest {
  id: string;
  orderId: string;
  testId: string;
  test?: LabTest;
  createdAt: Date;
}

export interface LabResult {
  id: string;
  orderId: string;
  testId: string;
  test?: LabTest;
  value: string;
  unit?: string;
  normalRange?: string;
  status: string;
  notes?: string;
  technician: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  interpretation?: string;
  flagged: boolean;
  method?: string;
  instrument?: string;
  testedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // Enriched data from backend
  technicianUser?: {
    firstName: string;
    lastName: string;
  };
  verifier?: {
    firstName: string;
    lastName: string;
  };
}

export interface LabDepartment {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  headTechnician?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabTemplate {
  id: string;
  name: string;
  description?: string;
  testIds: string[];
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request DTOs
export interface CreateLabTestRequest {
  name: string;
  code: string;
  category: string;
  department: string; // Department code, not ID
  description?: string;
  methodology?: string;
  sampleType?: string;
  price: number;
  normalRange?: string;
  unit?: string;
  duration?: string;
  sampleVolume?: string;
  fasting?: boolean;
}

export interface UpdateLabTestRequest {
  name?: string;
  code?: string;
  category?: string;
  department?: string; // Department code, not ID
  description?: string;
  methodology?: string;
  sampleType?: string;
  price?: number;
  normalRange?: string;
  unit?: string;
  duration?: string;
  sampleVolume?: string;
  fasting?: boolean;
}

export interface CreateLabOrderRequest {
  patientId: string;
  doctorId: string;
  testIds: string[];
  priority?: Priority;
  clinicalNotes?: string;
  requestedBy?: string;
}

export interface UpdateLabOrderStatusRequest {
  status: LabOrderStatus;
  notes?: string;
}

export interface CreateLabResultRequest {
  testId: string;
  value: string;
  unit?: string;
  normalRange?: string;
  status: string;
  notes?: string;
  method?: string;
  instrument?: string;
}

export interface UpdateLabResultRequest {
  value?: string;
  unit?: string;
  normalRange?: string;
  status?: string;
  notes?: string;
  method?: string;
  instrument?: string;
}

export interface VerifyLabResultRequest {
  verifiedById: string;
  notes?: string;
}

export interface CreateLabDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  headTechnician?: string;
}

export interface CreateLabTemplateRequest {
  name: string;
  description?: string;
  testIds: string[];
  category: string;
}

// Filter and Query types
export interface LabTestFilters {
  department?: string;
  category?: string;
  isActive?: boolean;
}

export interface LabOrderFilters {
  patientId?: string;
  doctorId?: string;
  status?: LabOrderStatus;
  priority?: Priority;
  limit?: number;
  offset?: number;
}

export interface DepartmentReportFilters {
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Error types
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}