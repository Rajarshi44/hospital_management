import { ApiClient } from './api-client'

// Types matching the backend DTOs
export interface Patient {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth: string | Date
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  bloodGroup?: string | null
  allergies?: string | null
  chronicConditions?: string | null
  currentMedications?: string | null
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreatePatientDto {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone: string
  email: string
  password: string
  address: string
  city: string
  state: string
  zipCode: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  bloodGroup?: string
  allergies?: string
  chronicConditions?: string
  currentMedications?: string
}

export interface UpdatePatientDto {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  bloodGroup?: string
  allergies?: string
  chronicConditions?: string
  currentMedications?: string
}

// Patient Service
export class PatientService {
  private static instance: PatientService

  static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService()
    }
    return PatientService.instance
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      return await ApiClient.get<Patient[]>('/patients', true)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch patients')
    }
  }

  async getPatientById(id: string): Promise<Patient> {
    try {
      return await ApiClient.get<Patient>(`/patients/${id}`, true)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch patient')
    }
  }

  async createPatient(data: CreatePatientDto): Promise<Patient> {
    try {
      return await ApiClient.post<Patient>('/patients', data, false)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create patient')
    }
  }

  async updatePatient(id: string, data: UpdatePatientDto): Promise<Patient> {
    try {
      return await ApiClient.patch<Patient>(`/patients/${id}`, data, true)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update patient')
    }
  }

  async deletePatient(id: string): Promise<{ message: string }> {
    try {
      return await ApiClient.delete<{ message: string }>(`/patients/${id}`, true)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete patient')
    }
  }

  async deactivatePatient(id: string): Promise<Patient> {
    try {
      return await ApiClient.request<Patient>(
        `/patients/${id}/deactivate`,
        { method: 'PATCH' },
        true
      )
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate patient')
    }
  }

  async activatePatient(id: string): Promise<Patient> {
    try {
      return await ApiClient.request<Patient>(
        `/patients/${id}/activate`,
        { method: 'PATCH' },
        true
      )
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to activate patient')
    }
  }

  // Helper function to search/filter patients
  searchPatients(patients: Patient[], query: string): Patient[] {
    if (!query.trim()) return patients

    const lowercaseQuery = query.toLowerCase()
    return patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(lowercaseQuery) ||
        patient.lastName.toLowerCase().includes(lowercaseQuery) ||
        patient.email.toLowerCase().includes(lowercaseQuery) ||
        patient.phone.includes(query) ||
        patient.id.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Helper to get full name
  getFullName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`.trim()
  }

  // Helper to parse allergies string to array
  getAllergiesArray(patient: Patient): string[] {
    if (!patient.allergies) return []
    return patient.allergies.split(',').map(a => a.trim()).filter(a => a.length > 0)
  }

  // Helper to parse medications string to array
  getMedicationsArray(patient: Patient): string[] {
    if (!patient.currentMedications) return []
    return patient.currentMedications.split(',').map(m => m.trim()).filter(m => m.length > 0)
  }

  // Helper to calculate age from date of birth
  calculateAge(dateOfBirth: string | Date): number {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    
    return age
  }
}
