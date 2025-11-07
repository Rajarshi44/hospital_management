/**
 * IPD Discharge Service
 * Handles all backend API calls for IPD discharges
 */

import { toast } from "@/hooks/use-toast"

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Types matching backend DTOs
export interface DischargeMedicationDto {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface CreateDischargeDto {
  admissionId: string;
  doctorId: string;
  dischargeDate?: string;
  dischargeTime?: string;
  dischargeType?: string;
  finalDiagnosis: string;
  treatmentSummary?: string;
  conditionAtDischarge?: string;
  followUpInstructions?: string;
  followUpDate?: string;
  restrictions?: string;
  notes?: string;
  medications?: DischargeMedicationDto[];
}

// Response types
export interface DischargeResponse {
  id: string;
  admissionId: string;
  doctorId: string;
  dischargeDate: string;
  dischargeTime: string;
  finalDiagnosis: string;
  treatmentSummary?: string;
  followUpInstructions?: string;
  medications?: DischargeMedicationDto[];
  createdAt: string;
  updatedAt: string;
  admission: {
    id: string;
    admissionId: string;
    patient: {
      id: string;
      firstName: string;
      lastName: string;
      patientId: string;
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
  };
}

export interface DischargePreparationResponse {
  admission: any;
  billingDetails: {
    days: number;
    bedCharges: number;
    medicalCharges: number;
    totalCharges: number;
  };
  treatmentHistory: any[];
  vitalsHistory: any[];
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
 * Create a discharge record
 */
export async function createDischarge(dischargeData: CreateDischargeDto): Promise<DischargeResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/ipd/discharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dischargeData)
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
 * Prepare discharge data (get billing and treatment summary)
 */
export async function prepareDischarge(admissionId: string): Promise<DischargePreparationResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/ipd/discharge/${admissionId}/prepare-discharge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error preparing discharge:', error);
    // Return default structure to prevent UI crashes
    return {
      admission: null,
      billingDetails: {
        days: 0,
        bedCharges: 0,
        medicalCharges: 0,
        totalCharges: 0,
      },
      treatmentHistory: [],
      vitalsHistory: [],
    };
  }
}

/**
 * Get discharge record by admission ID
 */
export async function getDischargeByAdmission(admissionId: string): Promise<DischargeResponse | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/ipd/discharge/admission/${admissionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No discharge record found
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error fetching discharge record:', error);
    return null;
  }
}

/**
 * Get all discharge records with optional filters
 */
export async function getDischargeRecords(filters?: {
  patientId?: string;
  doctorId?: string;
  dischargeDate?: string;
  limit?: number;
  offset?: number;
}): Promise<DischargeResponse[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.patientId) queryParams.append('patientId', filters.patientId);
    if (filters?.doctorId) queryParams.append('doctorId', filters.doctorId);
    if (filters?.dischargeDate) queryParams.append('dischargeDate', filters.dischargeDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const response = await fetch(`${API_BASE_URL}/ipd/discharge?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error fetching discharge records:', error);
    return [];
  }
}

/**
 * Transform frontend form data to backend DTO format
 */
export function transformDischargeFormToDTO(formData: any, admissionId: string, doctorId: string): CreateDischargeDto {
  const dto: CreateDischargeDto = {
    admissionId,
    doctorId,
    finalDiagnosis: formData.finalDiagnosis,
    treatmentSummary: formData.treatmentSummary,
    followUpInstructions: formData.followUpInstructions,
    
    // Optional fields
    dischargeDate: new Date().toISOString().split('T')[0],
    dischargeTime: new Date().toTimeString().slice(0, 5),
    dischargeType: 'NORMAL', // Default discharge type
    followUpDate: formData.followUpDate,
    notes: formData.notes || formData.specialInstructions,
    
    // Transform medications from form format to backend DTO format
    medications: formData.dischargeMedications?.map((med: any) => ({
      medicineName: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
    })) || [],
  };

  return dto;
}