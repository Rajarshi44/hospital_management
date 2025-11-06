/**
 * Enhanced IPD Admission Service
 * Handles all backend API calls for enhanced admission form
 */

import { toast } from "@/hooks/use-toast"

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Types for Enhanced Admission Form
export interface EnhancedCreatePatientDto {
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
  guardianName?: string;
  guardianRelation?: string;
  occupation?: string;
  idProofType?: string;
  idProofNumber?: string;
}

export interface EnhancedCreateAdmissionDto {
  // Patient Info (for auto-creation if needed)
  patientId?: string;
  patientData?: EnhancedCreatePatientDto;

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
  initialVitals?: any;
  initialDeposit?: number;
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
 * Get all departments
 */
export async function getDepartments(): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found for departments');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`Departments API error: ${response.status}`);
      return [];
    }

    const departments = await response.json();
    return departments;
    
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
}

/**
 * Get all doctors
 */
export async function getDoctors(): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found for doctors');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`Doctors API error: ${response.status}`);
      return [];
    }

    const doctors = await response.json();
    return doctors;
    
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}

/**
 * Get doctors by department
 */
export async function getDoctorsByDepartment(departmentId: string): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/doctors?departmentId=${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return [];

    const doctors = await response.json();
    return doctors;
    
  } catch (error) {
    console.error('Error fetching doctors by department:', error);
    return [];
  }
}

/**
 * Get all wards
 */
export async function getWards(): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found for wards');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/wards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`Wards API error: ${response.status}`);
      return [];
    }

    const wards = await response.json();
    return wards;
    
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
}

/**
 * Get available beds
 */
export async function getAvailableBeds(): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found for beds');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/wards/beds/available`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`Beds API error: ${response.status}`);
      return [];
    }

    const beds = await response.json();
    return beds;
    
  } catch (error) {
    console.error('Error fetching available beds:', error);
    return [];
  }
}

/**
 * Get beds by ward type
 */
export async function getBedsByWardType(wardType: string): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/wards/beds/available?wardType=${wardType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return [];

    const beds = await response.json();
    return beds;
    
  } catch (error) {
    console.error('Error fetching beds by ward type:', error);
    return [];
  }
}

/**
 * Upload documents
 */
export async function uploadDocuments(files: FileList, patientId?: string): Promise<string[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const uploadedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      if (patientId) {
        formData.append('patientId', patientId);
      }
      formData.append('category', 'admission');

      const response = await fetch(`${API_BASE_URL}/ipd/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        uploadedFiles.push(result.fileUrl || result.fileName);
      }
    }

    return uploadedFiles;
    
  } catch (error) {
    console.error('Error uploading documents:', error);
    return [];
  }
}

/**
 * Create enhanced admission
 */
export async function createEnhancedAdmission(admissionData: EnhancedCreateAdmissionDto): Promise<any> {
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
 * Transform enhanced form data to backend DTO format
 */
export function transformEnhancedFormToDTO(formData: any): EnhancedCreateAdmissionDto {
  // Split full name into first and last name
  const nameParts = formData.fullName.trim().split(' ');
  const firstName = nameParts[0] || formData.fullName;
  const lastName = nameParts.slice(1).join(' ') || '';

  // Map admission type to backend enum
  const mapAdmissionType = (type: string): 'EMERGENCY' | 'ELECTIVE' | 'REFERRAL' => {
    switch (type) {
      case 'Emergency':
        return 'EMERGENCY';
      case 'Scheduled':
        return 'ELECTIVE';
      case 'Transfer':
        return 'REFERRAL';
      default:
        return 'ELECTIVE';
    }
  };

  // Map gender to backend enum
  const mapGender = (gender: string): 'MALE' | 'FEMALE' | 'OTHER' => {
    switch (gender) {
      case 'Male':
        return 'MALE';
      case 'Female':
        return 'FEMALE';
      default:
        return 'OTHER';
    }
  };

  const dto: EnhancedCreateAdmissionDto = {
    doctorId: formData.admittingDoctor,
    bedId: formData.bedNo,
    admissionType: mapAdmissionType(formData.admissionType),
    chiefComplaint: formData.reasonForAdmission,
    provisionalDiagnosis: formData.reasonForAdmission,
    
    // Patient data for auto-creation
    patientData: {
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dob,
      gender: mapGender(formData.gender),
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      chronicConditions: formData.medicalHistory,
      currentMedications: formData.ongoingMedication,
      emergencyContactName: formData.guardianName,
      emergencyContactPhone: formData.guardianPhone,
      emergencyContactRelationship: formData.relation,
      guardianName: formData.guardianName,
      guardianRelation: formData.relation,
      insuranceProvider: formData.insuranceProvider,
      insurancePolicyNumber: formData.policyNumber,
    },

    // Financial details
    initialDeposit: formData.advanceAmount,
    
    // Insurance details
    insuranceDetails: formData.paymentMode === 'Insurance' 
      ? `${formData.insuranceProvider} - Policy: ${formData.policyNumber}` 
      : undefined,

    // Additional fields
    notes: `Department: ${formData.department}, Ward Type: ${formData.wardType}, Room: ${formData.roomNo}`,
  };

  return dto;
}