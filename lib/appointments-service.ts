import { ApiClient } from './api-client';

// Backend appointment status enum mapping
export enum BackendAppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED', 
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Frontend appointment status mapping
export type FrontendAppointmentStatus = 
  | 'Scheduled'
  | 'Checked-in' 
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

// Status mapping functions
export const mapBackendToFrontendStatus = (backendStatus: string): FrontendAppointmentStatus => {
  const statusMap: Record<string, FrontendAppointmentStatus> = {
    'SCHEDULED': 'Scheduled',
    'CONFIRMED': 'Scheduled',
    'CHECKED_IN': 'Checked-in',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
  };
  return statusMap[backendStatus] || 'Scheduled';
};

export const mapFrontendToBackendStatus = (frontendStatus: FrontendAppointmentStatus): BackendAppointmentStatus => {
  const statusMap: Record<FrontendAppointmentStatus, BackendAppointmentStatus> = {
    'Scheduled': BackendAppointmentStatus.SCHEDULED,
    'Checked-in': BackendAppointmentStatus.CHECKED_IN,
    'In Progress': BackendAppointmentStatus.IN_PROGRESS,
    'Completed': BackendAppointmentStatus.COMPLETED,
    'Cancelled': BackendAppointmentStatus.CANCELLED,
  };
  return statusMap[frontendStatus];
};

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: string;
  priority?: string;
  notes?: string;
  consultationFee?: number;
}

export interface UpdateAppointmentDto {
  patientId?: string;
  doctorId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  priority?: string;
  notes?: string;
  consultationFee?: number;
  status?: BackendAppointmentStatus;
}

export interface AppointmentResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientUHID: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  timeSlot: string;
  status: string;
  type?: string;
  priority?: string;
  notes?: string;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}

export class AppointmentsService {
  // Create appointment
  static async createAppointment(data: CreateAppointmentDto): Promise<AppointmentResponse> {
    console.log('🔥 AppointmentsService.createAppointment called with:', data);
    try {
      const result = await ApiClient.post('/appointments', data) as AppointmentResponse;
      console.log('🔥 AppointmentsService.createAppointment result:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.createAppointment error:', error);
      throw error;
    }
  }

  // Get all appointments
  static async getAppointments(filters?: {
    page?: number;
    limit?: number;
    status?: BackendAppointmentStatus;
    doctorId?: string;
    patientId?: string;
    includeOPD?: boolean;
  }): Promise<{
    appointments: AppointmentResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && key !== 'includeOPD') {
          params.append(key, value.toString());
        }
      });
    }
    
    // Add timestamp to prevent caching
    params.append('_t', Date.now().toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const endpoint = `/appointments${query}`;
    
    console.log('🔥 AppointmentsService.getAppointments - calling:', endpoint);
    
    try {
      const result = await ApiClient.get(endpoint) as {
        appointments: AppointmentResponse[];
        total: number;
        page: number;
        limit: number;
      };
      console.log('🔥 AppointmentsService.getAppointments - response:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.getAppointments error:', error);
      throw error;
    }
  }

  // Get appointment by ID
  static async getAppointment(id: string): Promise<AppointmentResponse> {
    console.log('🔥 AppointmentsService.getAppointment called with ID:', id);
    try {
      const result = await ApiClient.get(`/appointments/${id}`) as AppointmentResponse;
      console.log('🔥 AppointmentsService.getAppointment result:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.getAppointment error:', error);
      throw error;
    }
  }

  // Update appointment
  static async updateAppointment(id: string, data: UpdateAppointmentDto): Promise<AppointmentResponse> {
    console.log('🔥 AppointmentsService.updateAppointment called with:', { id, data });
    try {
      const result = await ApiClient.patch(`/appointments/${id}`, data) as AppointmentResponse;
      console.log('🔥 AppointmentsService.updateAppointment result:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.updateAppointment error:', error);
      throw error;
    }
  }

  // Update appointment status specifically
  static async updateAppointmentStatus(id: string, status: FrontendAppointmentStatus): Promise<AppointmentResponse> {
    console.log('🔥 AppointmentsService.updateAppointmentStatus called with:', { id, status });
    
    const backendStatus = mapFrontendToBackendStatus(status);
    console.log('🔥 Mapped to backend status:', backendStatus);
    
    try {
      const result = await ApiClient.patch(`/appointments/${id}/status`, { status: backendStatus }) as AppointmentResponse;
      console.log('🔥 AppointmentsService.updateAppointmentStatus result:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.updateAppointmentStatus error:', error);
      throw error;
    }
  }

  // Delete appointment
  static async deleteAppointment(id: string): Promise<{ message: string }> {
    console.log('🔥 AppointmentsService.deleteAppointment called with ID:', id);
    try {
      const result = await ApiClient.delete(`/appointments/${id}`) as { message: string };
      console.log('🔥 AppointmentsService.deleteAppointment result:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.deleteAppointment error:', error);
      throw error;
    }
  }

  // Get appointments by doctor
  static async getAppointmentsByDoctor(doctorId: string, date?: string): Promise<AppointmentResponse[]> {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const endpoint = `/appointments/doctor/${doctorId}${query}`;
    
    console.log('🔥 AppointmentsService.getAppointmentsByDoctor - calling:', endpoint);
    
    try {
      const result = await ApiClient.get(endpoint) as AppointmentResponse[];
      console.log('🔥 AppointmentsService.getAppointmentsByDoctor - response:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.getAppointmentsByDoctor error:', error);
      throw error;
    }
  }

  // Get appointments by patient
  static async getAppointmentsByPatient(patientId: string): Promise<AppointmentResponse[]> {
    console.log('🔥 AppointmentsService.getAppointmentsByPatient called with:', patientId);
    try {
      const result = await ApiClient.get(`/appointments/patient/${patientId}`) as AppointmentResponse[];
      console.log('🔥 AppointmentsService.getAppointmentsByPatient result:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.getAppointmentsByPatient error:', error);
      throw error;
    }
  }

  // Get available slots for a doctor
  static async getAvailableSlots(doctorId: string, date: string): Promise<any> {
    console.log('🔥 AppointmentsService.getAvailableSlots called with:', { doctorId, date });
    try {
      const result = await ApiClient.get(`/appointments/doctor/${doctorId}/available-slots?date=${date}`);
      console.log('🔥 AppointmentsService.getAvailableSlots result:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.getAvailableSlots error:', error);
      throw error;
    }
  }

  // Get doctors by department
  static async getDoctorsByDepartment(departmentId: string, date?: string): Promise<any> {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const endpoint = `/appointments/department/${departmentId}/doctors${query}`;
    
    console.log('🔥 AppointmentsService.getDoctorsByDepartment - calling:', endpoint);
    
    try {
      const result = await ApiClient.get(endpoint);
      console.log('🔥 AppointmentsService.getDoctorsByDepartment - response:', result);
      return result;
    } catch (error) {
      console.error('🔥 AppointmentsService.getDoctorsByDepartment error:', error);
      throw error;
    }
  }
}