/**
 * OPD (Outpatient Department) Type Definitions
 * Based on JSON Schema for OPD Patient Visit Form
 */

export type PatientType = "NEW" | "RETURNING";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type IdProofType = "Aadhaar" | "PAN" | "Passport" | "DriverLicense" | "Other";

export type Department =
  | "General Medicine"
  | "Pediatrics"
  | "Cardiology"
  | "Neurology"
  | "Orthopedics"
  | "Dermatology"
  | "ENT"
  | "Ophthalmology"
  | "Gynaecology"
  | "Surgery"
  | "Psychiatry"
  | "Radiology"
  | "Other";

export type VisitType = "OPD" | "EMERGENCY" | "REVIEW";
export type ReferralSource = "Self" | "Internal Doctor" | "External Doctor" | "Hospital" | "Organization" | "Other";
export type AppointmentMode = "Walk-in" | "Online" | "Phone";
export type VisitPriority = "Normal" | "Urgent" | "Emergency";
export type VisitStatus = "Pending" | "In-Progress" | "Completed" | "Cancelled";

export type MedicineRoute = "Oral" | "IV" | "IM" | "Subcutaneous" | "Topical" | "Inhalation" | "Other";
export type PaymentMode = "Cash" | "Card" | "UPI" | "Insurance" | "TPA" | "Other";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";
export type InvestigationUrgency = "Routine" | "Urgent" | "STAT";

export interface OPDRegistration {
  patientId: string; // UHID
  firstName: string;
  lastName?: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  guardianName?: string;
  guardianRelation?: string;
  bloodGroup?: BloodGroup;
  knownAllergies?: string;
  patientType: PatientType;
  occupation?: string;
  idProofType?: IdProofType;
  idProofNumber?: string;
}

export interface OPDVisit {
  visitId: string;
  visitDate: string; // ISO date-time
  department: Department;
  consultingDoctor: string; // Doctor ID
  doctorSpecialization?: string;
  visitType: VisitType;
  referralSource?: ReferralSource;
  appointmentMode: AppointmentMode;
  tokenNumber?: string;
  appointmentSlot?: string;
  visitPriority: VisitPriority;
  visitStatus: VisitStatus;
  followUpSuggestedDays?: number;
}

export interface OPDVitals {
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  temperature: number;
  bloodPressure: string; // Format: "120/80"
  pulseRate: number;
  respiratoryRate?: number;
  spo2: number;
  weightNote?: string;
}

export interface OPDClinical {
  chiefComplaint: string;
  durationOfSymptoms?: string;
  historyOfPresentIllness: string;
  pastMedicalHistory?: string;
  familyHistory?: string;
  personalHistory?: string;
  generalExamination?: string;
  systemicExamination?: string;
  allergiesDetailed?: string;
}

export interface OPDDiagnosis {
  provisionalDiagnosis?: string;
  finalDiagnosis?: string;
  icd10Codes?: string[];
}

export interface PrescriptionItem {
  drugName: string;
  strength: string;
  route: MedicineRoute;
  frequency: string;
  dose: string;
  duration: string;
  instructions?: string;
  notes?: string;
  prescribingDoctor?: string;
}

export interface OPDTreatment {
  prescriptionList: PrescriptionItem[];
  proceduresDone?: string[];
  treatmentNotes?: string;
}

export interface OPDInvestigations {
  recommendedLabTests?: string[];
  radiologyTests?: string[];
  investigationUrgency?: InvestigationUrgency;
}

export interface OPDBilling {
  consultationFee: number;
  investigationEstimate?: number;
  procedureCharges?: number;
  discountAmount?: number;
  totalPayable: number;
  paymentMode?: PaymentMode;
  paymentStatus: PaymentStatus;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  insurancePreAuthRequired?: boolean;
}

export interface OPDFollowUp {
  followUpDate?: string; // ISO date
  followUpInstructions?: string;
  referToIPD?: boolean;
  referralNote?: string;
}

export interface OPDMetadata {
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string; // ISO date-time
  modifiedAt?: string; // ISO date-time
}

export interface OPDVisitForm {
  registration: OPDRegistration;
  visit: OPDVisit;
  vitals: OPDVitals;
  clinical: OPDClinical;
  diagnosis: OPDDiagnosis;
  treatment: OPDTreatment;
  investigations?: OPDInvestigations;
  billing: OPDBilling;
  followUp?: OPDFollowUp;
  metadata?: OPDMetadata;
}

// Doctor availability types
export interface TimeSlot {
  time: string; // e.g., "09:00 AM"
  status: "available" | "booked" | "blocked";
  patientName?: string;
}

export interface DoctorSlots {
  doctorId: string;
  doctorName: string;
  date: string; // ISO date
  slots: TimeSlot[];
}

// Draft management
export interface OPDDraft {
  formData: Partial<OPDVisitForm>;
  timestamp: string;
  userId: string;
}
