import { Patient, Ward, Bed, Admission, Vitals, Treatment, DischargeRecord } from './ipd-types'

// Mock Patients (OPD patients who can be admitted)
export const mockOPDPatients: Patient[] = [
  {
    id: '1',
    uhid: 'PAT001',
    name: 'John Smith',
    age: 45,
    gender: 'male',
    phone: '+1-555-0101',
    email: 'john.smith@email.com',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: {
      name: 'Jane Smith',
      relation: 'Wife',
      phone: '+1-555-0102'
    },
    bloodGroup: 'A+',
    allergies: ['Penicillin'],
    medicalHistory: 'Hypertension, Diabetes Type 2'
  },
  {
    id: '2',
    uhid: 'PAT002',
    name: 'Maria Garcia',
    age: 32,
    gender: 'female',
    phone: '+1-555-0201',
    email: 'maria.garcia@email.com',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    emergencyContact: {
      name: 'Carlos Garcia',
      relation: 'Husband',
      phone: '+1-555-0202'
    },
    bloodGroup: 'O-',
    allergies: [],
    medicalHistory: 'No significant medical history'
  },
  {
    id: '3',
    uhid: 'PAT003',
    name: 'Robert Johnson',
    age: 67,
    gender: 'male',
    phone: '+1-555-0301',
    address: '789 Pine St, Chicago, IL 60601',
    emergencyContact: {
      name: 'Mary Johnson',
      relation: 'Daughter',
      phone: '+1-555-0302'
    },
    bloodGroup: 'B+',
    allergies: ['Aspirin', 'Shellfish'],
    medicalHistory: 'Coronary artery disease, Previous myocardial infarction'
  },
  {
    id: '4',
    uhid: 'PAT004',
    name: 'Sarah Wilson',
    age: 28,
    gender: 'female',
    phone: '+1-555-0401',
    email: 'sarah.wilson@email.com',
    address: '321 Elm St, Houston, TX 77001',
    emergencyContact: {
      name: 'Mike Wilson',
      relation: 'Brother',
      phone: '+1-555-0402'
    },
    bloodGroup: 'AB+',
    allergies: [],
    medicalHistory: 'Asthma'
  },
  {
    id: '5',
    uhid: 'PAT005',
    name: 'David Brown',
    age: 55,
    gender: 'male',
    phone: '+1-555-0501',
    address: '654 Maple Dr, Phoenix, AZ 85001',
    emergencyContact: {
      name: 'Lisa Brown',
      relation: 'Wife',
      phone: '+1-555-0502'
    },
    bloodGroup: 'O+',
    allergies: ['Latex'],
    medicalHistory: 'Hypertension, High cholesterol'
  }
]

// Mock Wards
export const mockWards: Ward[] = [
  {
    id: '1',
    name: 'General Ward A',
    type: 'general',
    totalBeds: 20,
    occupiedBeds: 15,
    chargesPerDay: 150
  },
  {
    id: '2',
    name: 'General Ward B',
    type: 'general',
    totalBeds: 20,
    occupiedBeds: 12,
    chargesPerDay: 150
  },
  {
    id: '3',
    name: 'Private Ward',
    type: 'private',
    totalBeds: 10,
    occupiedBeds: 7,
    chargesPerDay: 500
  },
  {
    id: '4',
    name: 'Semi-Private Ward',
    type: 'semi-private',
    totalBeds: 15,
    occupiedBeds: 10,
    chargesPerDay: 300
  },
  {
    id: '5',
    name: 'ICU Ward',
    type: 'icu',
    totalBeds: 8,
    occupiedBeds: 6,
    chargesPerDay: 1200
  },
  {
    id: '6',
    name: 'Emergency Ward',
    type: 'emergency',
    totalBeds: 12,
    occupiedBeds: 8,
    chargesPerDay: 800
  }
]

// Mock Beds
export const mockBeds: Bed[] = [
  // General Ward A
  { id: '1', wardId: '1', wardName: 'General Ward A', bedNumber: 'A001', type: 'general', isOccupied: true, chargesPerDay: 150, amenities: ['TV', 'Fan'] },
  { id: '2', wardId: '1', wardName: 'General Ward A', bedNumber: 'A002', type: 'general', isOccupied: false, chargesPerDay: 150, amenities: ['TV', 'Fan'] },
  { id: '3', wardId: '1', wardName: 'General Ward A', bedNumber: 'A003', type: 'general', isOccupied: true, chargesPerDay: 150, amenities: ['TV', 'Fan'] },
  { id: '4', wardId: '1', wardName: 'General Ward A', bedNumber: 'A004', type: 'general', isOccupied: false, chargesPerDay: 150, amenities: ['TV', 'Fan'] },
  { id: '5', wardId: '1', wardName: 'General Ward A', bedNumber: 'A005', type: 'general', isOccupied: false, chargesPerDay: 150, amenities: ['TV', 'Fan'] },
  
  // Private Ward
  { id: '11', wardId: '3', wardName: 'Private Ward', bedNumber: 'P001', type: 'private', isOccupied: true, chargesPerDay: 500, amenities: ['TV', 'AC', 'WiFi', 'Attached Bathroom', 'Sofa'] },
  { id: '12', wardId: '3', wardName: 'Private Ward', bedNumber: 'P002', type: 'private', isOccupied: false, chargesPerDay: 500, amenities: ['TV', 'AC', 'WiFi', 'Attached Bathroom', 'Sofa'] },
  { id: '13', wardId: '3', wardName: 'Private Ward', bedNumber: 'P003', type: 'private', isOccupied: false, chargesPerDay: 500, amenities: ['TV', 'AC', 'WiFi', 'Attached Bathroom', 'Sofa'] },
  
  // ICU Ward
  { id: '21', wardId: '5', wardName: 'ICU Ward', bedNumber: 'ICU001', type: 'icu', isOccupied: true, chargesPerDay: 1200, amenities: ['Ventilator', 'Cardiac Monitor', 'Defibrillator'] },
  { id: '22', wardId: '5', wardName: 'ICU Ward', bedNumber: 'ICU002', type: 'icu', isOccupied: false, chargesPerDay: 1200, amenities: ['Ventilator', 'Cardiac Monitor', 'Defibrillator'] },
  { id: '23', wardId: '5', wardName: 'ICU Ward', bedNumber: 'ICU003', type: 'icu', isOccupied: true, chargesPerDay: 1200, amenities: ['Ventilator', 'Cardiac Monitor', 'Defibrillator'] }
]

// Mock Admissions
export const mockAdmissions: Admission[] = [
  {
    id: '1',
    admissionId: 'ADM001',
    patientId: '1',
    patientName: 'John Smith',
    uhid: 'PAT001',
    wardId: '1',
    wardName: 'General Ward A',
    bedId: '1',
    bedNumber: 'A001',
    consultingDoctorId: '1',
    consultingDoctorName: 'Dr. Sarah Johnson',
    departmentId: '1',
    departmentName: 'Cardiology',
    admissionDate: '2025-10-20',
    admissionTime: '14:30',
    reasonForAdmission: 'Chest pain and shortness of breath',
    tentativeDiagnosis: 'Acute myocardial infarction',
    status: 'critical',
    initialDeposit: 5000,
    attendantDetails: {
      name: 'Jane Smith',
      relation: 'Wife',
      phone: '+1-555-0102',
      address: '123 Main St, New York, NY 10001'
    },
    createdAt: '2025-10-20T14:30:00Z',
    updatedAt: '2025-10-23T10:15:00Z'
  },
  {
    id: '2',
    admissionId: 'ADM002',
    patientId: '3',
    patientName: 'Robert Johnson',
    uhid: 'PAT003',
    wardId: '5',
    wardName: 'ICU Ward',
    bedId: '21',
    bedNumber: 'ICU001',
    consultingDoctorId: '1',
    consultingDoctorName: 'Dr. Sarah Johnson',
    departmentId: '1',
    departmentName: 'Cardiology',
    admissionDate: '2025-10-21',
    admissionTime: '09:15',
    reasonForAdmission: 'Severe chest pain, suspected heart attack',
    tentativeDiagnosis: 'STEMI - ST-elevation myocardial infarction',
    status: 'critical',
    initialDeposit: 15000,
    attendantDetails: {
      name: 'Mary Johnson',
      relation: 'Daughter',
      phone: '+1-555-0302',
      address: '789 Pine St, Chicago, IL 60601'
    },
    createdAt: '2025-10-21T09:15:00Z',
    updatedAt: '2025-10-23T08:45:00Z'
  },
  {
    id: '3',
    admissionId: 'ADM003',
    patientId: '4',
    patientName: 'Sarah Wilson',
    uhid: 'PAT004',
    wardId: '3',
    wardName: 'Private Ward',
    bedId: '11',
    bedNumber: 'P001',
    consultingDoctorId: '3',
    consultingDoctorName: 'Dr. Emily Davis',
    departmentId: '3',
    departmentName: 'Pediatrics',
    admissionDate: '2025-10-22',
    admissionTime: '16:45',
    reasonForAdmission: 'Severe asthma exacerbation',
    tentativeDiagnosis: 'Acute severe asthma',
    status: 'stable',
    initialDeposit: 3000,
    attendantDetails: {
      name: 'Mike Wilson',
      relation: 'Brother',
      phone: '+1-555-0402',
      address: '321 Elm St, Houston, TX 77001'
    },
    createdAt: '2025-10-22T16:45:00Z',
    updatedAt: '2025-10-23T12:30:00Z'
  }
]

// Mock Vitals
export const mockVitals: Vitals[] = [
  {
    id: '1',
    admissionId: 'ADM001',
    recordedAt: '2025-10-23T08:00:00Z',
    temperature: 98.6,
    bloodPressure: { systolic: 140, diastolic: 90 },
    heartRate: 88,
    respiratoryRate: 18,
    oxygenSaturation: 96,
    bloodSugar: 120,
    weight: 75,
    nursingNotes: 'Patient stable, responding well to treatment',
    recordedBy: 'Nurse Johnson'
  },
  {
    id: '2',
    admissionId: 'ADM002',
    recordedAt: '2025-10-23T08:00:00Z',
    temperature: 99.2,
    bloodPressure: { systolic: 160, diastolic: 100 },
    heartRate: 102,
    respiratoryRate: 22,
    oxygenSaturation: 94,
    bloodSugar: 150,
    nursingNotes: 'Patient shows signs of improvement, vital signs stabilizing',
    recordedBy: 'Nurse Smith'
  }
]

// Mock Treatments
export const mockTreatments: Treatment[] = [
  {
    id: '1',
    admissionId: 'ADM001',
    type: 'medication',
    description: 'Aspirin',
    prescribedBy: 'Dr. Sarah Johnson',
    prescribedAt: '2025-10-20T15:00:00Z',
    dosage: '75mg',
    frequency: 'Once daily',
    duration: '7 days',
    instructions: 'Take with food',
    status: 'active'
  },
  {
    id: '2',
    admissionId: 'ADM001',
    type: 'lab_order',
    description: 'Complete Blood Count, Lipid Profile',
    prescribedBy: 'Dr. Sarah Johnson',
    prescribedAt: '2025-10-20T15:30:00Z',
    instructions: 'Fasting required',
    status: 'completed'
  },
  {
    id: '3',
    admissionId: 'ADM002',
    type: 'medication',
    description: 'Metoprolol',
    prescribedBy: 'Dr. Sarah Johnson',
    prescribedAt: '2025-10-21T10:00:00Z',
    dosage: '50mg',
    frequency: 'Twice daily',
    duration: '30 days',
    instructions: 'Monitor blood pressure',
    status: 'active'
  }
]

// Utility functions for bed availability
export const getAvailableBeds = (wardId?: string): Bed[] => {
  return mockBeds.filter(bed => !bed.isOccupied && (wardId ? bed.wardId === wardId : true))
}

export const getBedsByWard = (wardId: string): Bed[] => {
  return mockBeds.filter(bed => bed.wardId === wardId)
}

export const getPatientAdmissions = (patientId: string): Admission[] => {
  return mockAdmissions.filter(admission => admission.patientId === patientId)
}

export const getAdmissionsByStatus = (status: string): Admission[] => {
  return mockAdmissions.filter(admission => admission.status === status)
}

export const getDaysAdmitted = (admissionDate: string): number => {
  const admission = new Date(admissionDate)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - admission.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}