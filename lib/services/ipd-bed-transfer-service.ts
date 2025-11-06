/**
 * IPD Bed Transfer Service
 * Handles all backend API calls for IPD bed transfers
 */

import { toast } from "@/hooks/use-toast"

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Types matching backend DTOs
export interface CreateTransferDto {
  admissionId: string;
  toBedId: string;
  reason: string;
  approvedBy: string;
  transferDate?: string;
  transferTime?: string;
  notes?: string;
}

// Response types
export interface TransferResponse {
  id: string;
  admissionId: string;
  fromBedId: string;
  toBedId: string;
  reason: string;
  transferDate: string;
  transferTime: string;
  approvedBy: string;
  notes?: string;
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
  };
  fromBed: {
    id: string;
    bedNumber: string;
    ward: {
      id: string;
      name: string;
      wardNumber: string;
    };
  };
  toBed: {
    id: string;
    bedNumber: string;
    ward: {
      id: string;
      name: string;
      wardNumber: string;
    };
  };
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
 * Create a bed transfer
 */
export async function createBedTransfer(transferData: CreateTransferDto): Promise<TransferResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/ipd/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transferData)
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
 * Get all transfer records with optional filters
 */
export async function getBedTransfers(filters?: {
  admissionId?: string;
  patientId?: string;
  wardId?: string;
  transferDate?: string;
  limit?: number;
  offset?: number;
}): Promise<TransferResponse[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.admissionId) queryParams.append('admissionId', filters.admissionId);
    if (filters?.patientId) queryParams.append('patientId', filters.patientId);
    if (filters?.wardId) queryParams.append('wardId', filters.wardId);
    if (filters?.transferDate) queryParams.append('transferDate', filters.transferDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const response = await fetch(`${API_BASE_URL}/ipd/transfers?${queryParams.toString()}`, {
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
    console.error('Error fetching bed transfers:', error);
    return [];
  }
}

/**
 * Get transfer history for an admission
 */
export async function getTransferHistoryByAdmission(admissionId: string): Promise<TransferResponse[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/ipd/transfers/admission/${admissionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No transfer history found
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    return [];
  }
}

/**
 * Get available beds for transfer (excluding current bed)
 */
export async function getAvailableBedsForTransfer(currentBedId: string): Promise<any[]> {
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
    // Filter out the current bed
    return beds.filter((bed: any) => bed.id !== currentBedId);
    
  } catch (error) {
    console.error('Error fetching available beds:', error);
    return [];
  }
}

/**
 * Transform frontend form data to backend DTO format
 */
export function transformTransferFormToDTO(
  formData: any, 
  admissionId: string, 
  approvedBy: string
): CreateTransferDto {
  const dto: CreateTransferDto = {
    admissionId,
    toBedId: formData.toBedId,
    reason: formData.reason,
    approvedBy,
    
    // Optional fields
    transferDate: new Date().toISOString().split('T')[0],
    transferTime: new Date().toTimeString().slice(0, 5),
    notes: formData.notes || formData.additionalNotes,
  };

  return dto;
}