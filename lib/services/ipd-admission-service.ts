/**
 * IPD Admission Service
 * Handles all backend API calls for IPD admissions
 */

import { toast } from "@/hooks/use-toast"

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Types matching backend DTOs
export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

export interface CreateIPDVitalsDto {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  urinOutput?: number;
  fluidIntake?: number;
  painScale?: number;
  shift?: string;
  notes?: string;
}

export interface CreateAdmissionDto {
  // Patient Info (for auto-creation if needed)
  patientId?: string;
  patientData?: CreatePatientDto;

  // Admission Info
  doctorId: string;
  bedId: string;
  admissionDate?: string;
  admissionTime?: string;
  admissionType: 'EMERGENCY' | 'ELECTIVE' | 'REFERRAL';
  category?: string;
  referralSource?: string;
  referredBy?: string;

  // Clinical Details
  chiefComplaint: string;
  presentIllness?: string;
  pastHistory?: string;
  familyHistory?: string;
  personalHistory?: string;
  generalCondition?: string;
  consciousness?: string;
  provisionalDiagnosis: string;
  finalDiagnosis?: string;
  treatmentPlan?: string;
  expectedDischargeDate?: string;

  // Financial
  estimatedCost?: number;
  depositAmount?: number;

  // Additional fields
  emergencyContact?: string;
  insuranceDetails?: string;
  notes?: string;

  // Initial vitals
  initialVitals?: CreateIPDVitalsDto;
  initialDeposit?: number;
}

// Response types
export interface AdmissionResponse {
  id: string;
  admissionId: string;
  patientId: string;
  doctorId: string;
  bedId: string;
  admissionDate: string;
  admissionTime: string;
  admissionType: string;
  chiefComplaint: string;
  provisionalDiagnosis: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  doctor: {
    id: string;
    doctorId: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  bed: {
    id: string;
    bedNumber: string;
    ward: {
      id: string;
      name: string;
      wardNumber: string;
    };
  };
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

/**
 * Get auth token from local storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Handle API errors consistently
 */
function handleApiError(error: any): never {
  console.error('API Error:', error);
  
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else if (error.message) {
    throw new Error(error.message);
  } else {
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Create a new IPD admission
 */
export async function createIPDAdmission(admissionData: CreateAdmissionDto): Promise<AdmissionResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/ipd/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(admissionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Get all available beds for IPD admission
 */
export async function getAvailableBeds(): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/wards/beds/available`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const beds = await response.json();
    return beds;
    
  } catch (error) {
    console.error('Error fetching available beds:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
}

/**
 * Get all doctors for IPD admission
 */
export async function getDoctorsForIPD(): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const doctors = await response.json();
    return doctors;
    
  } catch (error) {
    console.error('Error fetching doctors:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
}

/**
 * Search for existing patients
 */
export async function searchPatients(query: string): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/patients/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const patients = await response.json();
    return patients;
    
  } catch (error) {
    console.error('Error searching patients:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
}

/**
 * Transform frontend form data to backend DTO format
 */
export function transformFormDataToDTO(formData: any): CreateAdmissionDto {
  // Map form data to backend DTO structure
  const dto: CreateAdmissionDto = {
    doctorId: formData.assignedDoctorId,
    bedId: formData.bedId,
    admissionType: mapAdmissionType(formData.admissionType),
    chiefComplaint: formData.reasonForAdmission,
    provisionalDiagnosis: formData.reasonForAdmission, // Use same as chief complaint if no separate field
    
    // Optional fields
    admissionDate: formData.admissionDate,
    admissionTime: formData.admissionTime,
    category: formData.wardType,
    notes: formData.specialInstructions,
    
    // Financial
    initialDeposit: formData.initialDeposit,
    
    // Emergency contact
    emergencyContact: formData.emergencyContactName && formData.emergencyContactNumber 
      ? `${formData.emergencyContactName} - ${formData.emergencyContactNumber}`
      : undefined,
      
    // Insurance details
    insuranceDetails: formData.insuranceName && formData.policyNumber
      ? `${formData.insuranceName} - Policy: ${formData.policyNumber}`
      : undefined
  };

  // Handle patient data
  if (formData.selectedPatientId && formData.selectedPatientId !== "") {
    dto.patientId = formData.selectedPatientId;
  } else if (formData.isNewPatient || !formData.selectedPatientId) {
    // Create new patient data
    dto.patientData = {
      firstName: formData.fullName.split(' ')[0] || formData.fullName,
      lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
      email: formData.email,
      phone: formData.contactNumber,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER',
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactNumber,
    };
  }

  return dto;
}

/**
 * Map frontend admission type to backend enum
 */
function mapAdmissionType(frontendType: string): 'EMERGENCY' | 'ELECTIVE' | 'REFERRAL' {
  switch (frontendType) {
    case 'emergency':
      return 'EMERGENCY';
    case 'planned':
      return 'ELECTIVE';
    case 'referral':
      return 'REFERRAL';
    default:
      return 'ELECTIVE';
  }
}