// IPD (Inpatient Department) Types

export interface Patient {
  id: string
  uhid: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  phone: string
  email?: string
  address: string
  emergencyContact: {
    name: string
    relation: string
    phone: string
  }
  bloodGroup?: string
  allergies?: string[]
  medicalHistory?: string
}

export interface Ward {
  id: string
  name: string
  type: 'general' | 'private' | 'semi-private' | 'icu' | 'emergency'
  totalBeds: number
  occupiedBeds: number
  chargesPerDay: number
}

export interface Bed {
  id: string
  wardId: string
  wardName: string
  bedNumber: string
  type: 'general' | 'private' | 'semi-private' | 'icu' | 'emergency'
  isOccupied: boolean
  chargesPerDay: number
  amenities: string[]
}

export interface Admission {
  id: string
  admissionId: string
  patientId: string
  patientName: string
  uhid: string
  wardId: string
  wardName: string
  bedId: string
  bedNumber: string
  consultingDoctorId: string
  consultingDoctorName: string
  departmentId: string
  departmentName: string
  admissionDate: string
  admissionTime: string
  reasonForAdmission: string
  tentativeDiagnosis: string
  status: 'stable' | 'critical' | 'observation' | 'discharged'
  initialDeposit?: number
  attendantDetails: {
    name: string
    relation: string
    phone: string
    address: string
  }
  createdAt: string
  updatedAt: string
}

export interface Vitals {
  id: string
  admissionId: string
  recordedAt: string
  temperature: number
  bloodPressure: {
    systolic: number
    diastolic: number
  }
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  bloodSugar?: number
  weight?: number
  height?: number
  nursingNotes?: string
  recordedBy: string
}

export interface Treatment {
  id: string
  admissionId: string
  type: 'medication' | 'procedure' | 'lab_order' | 'investigation'
  description: string
  prescribedBy: string
  prescribedAt: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
  status: 'active' | 'completed' | 'discontinued'
}

export interface DischargeRecord {
  id: string
  admissionId: string
  dischargeDate: string
  dischargeTime: string
  finalDiagnosis: string
  treatmentSummary: string
  dischargeMedications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
  followUpInstructions: string
  followUpDate?: string
  billingAmount?: number
  dischargedBy: string
  approvedBy?: string
  attachedDocuments?: string[]
  createdAt: string
}

export interface BedTransfer {
  id: string
  admissionId: string
  fromWardId: string
  fromBedId: string
  toWardId: string
  toBedId: string
  transferDate: string
  transferTime: string
  reason: string
  transferredBy: string
  approvedBy?: string
}

// Form Data Types
export interface AdmissionFormData {
  patientId: string
  isNewPatient: boolean
  patientDetails: Partial<Patient>
  wardId: string
  bedId: string
  consultingDoctorId: string
  departmentId: string
  admissionDate: string
  admissionTime: string
  reasonForAdmission: string
  tentativeDiagnosis: string
  initialDeposit?: number
  attendantDetails: {
    name: string
    relation: string
    phone: string
    address: string
  }
}

export interface VitalsFormData {
  temperature: number
  systolic: number
  diastolic: number
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  bloodSugar?: number
  weight?: number
  height?: number
  nursingNotes?: string
}

export interface TreatmentFormData {
  type: 'medication' | 'procedure' | 'lab_order' | 'investigation'
  description: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
}

export interface DischargeFormData {
  finalDiagnosis: string
  treatmentSummary: string
  dischargeMedications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
  followUpInstructions: string
  followUpDate?: string
  attachedDocuments?: string[]
}

export interface BedTransferFormData {
  toWardId: string
  toBedId: string
  reason: string
}