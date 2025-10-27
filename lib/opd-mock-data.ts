/**
 * OPD Mock Data
 * Sample data for development and testing
 */

import type { OPDVisitForm, DoctorSlots, TimeSlot } from "./opd-types";

// Mock doctor availability slots
export const mockDoctorSlots: DoctorSlots[] = [
  {
    doctorId: "DR-100",
    doctorName: "Dr. Amit Kumar",
    date: "2025-10-27",
    slots: [
      { time: "09:00 AM", status: "available" },
      { time: "09:30 AM", status: "booked", patientName: "Rahul Sharma" },
      { time: "10:00 AM", status: "available" },
      { time: "10:30 AM", status: "available" },
      { time: "11:00 AM", status: "booked", patientName: "Priya Singh" },
      { time: "11:30 AM", status: "available" },
      { time: "02:00 PM", status: "available" },
      { time: "02:30 PM", status: "available" },
      { time: "03:00 PM", status: "blocked" },
      { time: "03:30 PM", status: "available" },
      { time: "04:00 PM", status: "available" },
    ],
  },
  {
    doctorId: "DR-101",
    doctorName: "Dr. Sneha Reddy",
    date: "2025-10-27",
    slots: [
      { time: "09:00 AM", status: "available" },
      { time: "09:45 AM", status: "available" },
      { time: "10:30 AM", status: "booked", patientName: "Amit Patel" },
      { time: "11:15 AM", status: "available" },
      { time: "12:00 PM", status: "available" },
      { time: "02:30 PM", status: "available" },
      { time: "03:15 PM", status: "available" },
      { time: "04:00 PM", status: "booked", patientName: "Sanjay Kumar" },
    ],
  },
  {
    doctorId: "DR-102",
    doctorName: "Dr. Rajesh Gupta",
    date: "2025-10-27",
    slots: [
      { time: "08:00 AM", status: "available" },
      { time: "08:30 AM", status: "available" },
      { time: "09:00 AM", status: "booked", patientName: "Anita Desai" },
      { time: "09:30 AM", status: "available" },
      { time: "10:00 AM", status: "available" },
      { time: "10:30 AM", status: "booked", patientName: "Vikram Mehta" },
      { time: "11:00 AM", status: "available" },
    ],
  },
];

// Sample OPD visits
export const mockOPDVisits: OPDVisitForm[] = [
  {
    registration: {
      patientId: "UHID-2025-0001",
      firstName: "Rajarshi",
      lastName: "Das",
      age: 28,
      gender: "MALE",
      phone: "9876543210",
      email: "rajarshi@example.com",
      address: "123 Park Street, Kolkata",
      bloodGroup: "O+",
      knownAllergies: "None",
      patientType: "RETURNING",
      occupation: "Software Engineer",
      idProofType: "Aadhaar",
      idProofNumber: "1234-5678-9012",
    },
    visit: {
      visitId: "VIS-20251027-1001",
      visitDate: "2025-10-27T14:30:00Z",
      department: "General Medicine",
      consultingDoctor: "DR-100",
      doctorSpecialization: "General Physician",
      visitType: "OPD",
      referralSource: "Self",
      appointmentMode: "Walk-in",
      tokenNumber: "T-045",
      appointmentSlot: "02:30 PM",
      visitPriority: "Normal",
      visitStatus: "Completed",
      followUpSuggestedDays: 7,
    },
    vitals: {
      heightCm: 175,
      weightKg: 72,
      bmi: 23.51,
      temperature: 37.0,
      bloodPressure: "120/80",
      pulseRate: 78,
      respiratoryRate: 16,
      spo2: 98,
    },
    clinical: {
      chiefComplaint: "Fever and sore throat",
      durationOfSymptoms: "3 days",
      historyOfPresentIllness:
        "Patient presents with onset of fever 3 days ago, accompanied by sore throat and difficulty swallowing. No cough or breathlessness. Fever peaks at evening, associated with chills.",
      pastMedicalHistory: "No significant past medical history",
      generalExamination: "Patient conscious, oriented, moderately built",
      systemicExamination: "CVS: S1 S2 heard, no murmurs. RS: Clear bilateral air entry",
      allergiesDetailed: "No known drug allergies",
    },
    diagnosis: {
      provisionalDiagnosis: "Acute pharyngitis",
      finalDiagnosis: "Acute viral pharyngitis",
      icd10Codes: ["J02.9"],
    },
    treatment: {
      prescriptionList: [
        {
          drugName: "Paracetamol",
          strength: "500mg",
          route: "Oral",
          frequency: "TID",
          dose: "1 tablet",
          duration: "5 days",
          instructions: "After food",
          prescribingDoctor: "DR-100",
        },
        {
          drugName: "Azithromycin",
          strength: "500mg",
          route: "Oral",
          frequency: "OD",
          dose: "1 tablet",
          duration: "3 days",
          instructions: "Before food",
          prescribingDoctor: "DR-100",
        },
        {
          drugName: "Chlorhexidine Gargle",
          strength: "0.2%",
          route: "Topical",
          frequency: "TID",
          dose: "10ml",
          duration: "5 days",
          instructions: "Gargle and spit, do not swallow",
          prescribingDoctor: "DR-100",
        },
      ],
      treatmentNotes: "Rest, adequate hydration, avoid cold beverages",
    },
    investigations: {
      recommendedLabTests: ["Complete Blood Count", "Throat Swab Culture"],
      radiologyTests: [],
      investigationUrgency: "Routine",
    },
    billing: {
      consultationFee: 300,
      investigationEstimate: 450,
      procedureCharges: 0,
      discountAmount: 0,
      totalPayable: 750,
      paymentMode: "Cash",
      paymentStatus: "Paid",
    },
    followUp: {
      followUpDate: "2025-11-03",
      followUpInstructions: "Review in one week. Return earlier if symptoms worsen or high fever persists.",
      referToIPD: false,
    },
    metadata: {
      createdBy: "reception-user-01",
      createdAt: "2025-10-27T14:30:00Z",
      modifiedAt: "2025-10-27T15:15:00Z",
    },
  },
  {
    registration: {
      patientId: "UHID-2025-0045",
      firstName: "Ananya",
      lastName: "Sharma",
      age: 32,
      gender: "FEMALE",
      phone: "9123456789",
      email: "ananya.sharma@example.com",
      address: "45 MG Road, Bangalore",
      bloodGroup: "A+",
      knownAllergies: "Penicillin allergy",
      patientType: "NEW",
      occupation: "Teacher",
      idProofType: "Aadhaar",
      idProofNumber: "9876-5432-1098",
    },
    visit: {
      visitId: "VIS-20251027-1002",
      visitDate: "2025-10-27T10:00:00Z",
      department: "Cardiology",
      consultingDoctor: "DR-101",
      doctorSpecialization: "Cardiologist",
      visitType: "OPD",
      referralSource: "Internal Doctor",
      appointmentMode: "Online",
      appointmentSlot: "10:00 AM",
      visitPriority: "Urgent",
      visitStatus: "In-Progress",
    },
    vitals: {
      heightCm: 162,
      weightKg: 68,
      bmi: 25.89,
      temperature: 36.8,
      bloodPressure: "145/95",
      pulseRate: 88,
      respiratoryRate: 18,
      spo2: 97,
    },
    clinical: {
      chiefComplaint: "Chest discomfort and palpitations",
      durationOfSymptoms: "2 weeks",
      historyOfPresentIllness:
        "Patient complains of intermittent chest discomfort for 2 weeks, associated with palpitations. Episodes last 5-10 minutes. No radiation, no breathlessness at rest.",
      pastMedicalHistory: "Hypertension diagnosed 1 year ago",
      familyHistory: "Father had MI at age 55",
      generalExamination: "Patient anxious, well-built",
      systemicExamination: "CVS: S1 S2 normal, no murmurs. BP elevated.",
    },
    diagnosis: {
      provisionalDiagnosis: "Suspected angina with uncontrolled hypertension",
      icd10Codes: ["I20.9", "I10"],
    },
    treatment: {
      prescriptionList: [
        {
          drugName: "Amlodipine",
          strength: "5mg",
          route: "Oral",
          frequency: "OD",
          dose: "1 tablet",
          duration: "30 days",
          instructions: "Morning after breakfast",
          prescribingDoctor: "DR-101",
        },
        {
          drugName: "Aspirin",
          strength: "75mg",
          route: "Oral",
          frequency: "OD",
          dose: "1 tablet",
          duration: "30 days",
          instructions: "After dinner",
          prescribingDoctor: "DR-101",
        },
      ],
      treatmentNotes: "Lifestyle modification advised. Low salt diet. Regular exercise.",
    },
    investigations: {
      recommendedLabTests: ["Lipid Profile", "ECG", "Troponin I"],
      radiologyTests: ["2D Echo", "TMT (Treadmill Test)"],
      investigationUrgency: "Urgent",
    },
    billing: {
      consultationFee: 800,
      investigationEstimate: 2500,
      procedureCharges: 0,
      discountAmount: 100,
      totalPayable: 3200,
      paymentMode: "Card",
      paymentStatus: "Paid",
    },
    followUp: {
      followUpDate: "2025-11-10",
      followUpInstructions: "Bring all investigation reports. May need stress test.",
      referToIPD: false,
    },
    metadata: {
      createdBy: "reception-user-02",
      createdAt: "2025-10-27T10:00:00Z",
      modifiedAt: "2025-10-27T10:45:00Z",
    },
  },
];

// Helper function to get slots for a doctor
export function getDoctorSlots(doctorId: string, date: string): TimeSlot[] {
  const doctorSlot = mockDoctorSlots.find(
    (slot) => slot.doctorId === doctorId && slot.date === date
  );
  return doctorSlot?.slots || [];
}

// Helper function to check if a slot is available
export function isSlotAvailable(doctorId: string, date: string, time: string): boolean {
  const slots = getDoctorSlots(doctorId, date);
  const slot = slots.find((s) => s.time === time);
  return slot?.status === "available";
}

// Generate visit ID
export function generateVisitId(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `VIS-${year}${month}${day}-${random}`;
}

// Calculate BMI
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm === 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 100) / 100;
}
