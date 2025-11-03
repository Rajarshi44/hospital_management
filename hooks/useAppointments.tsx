"use client";

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

// Types
interface Doctor {
  id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialization: string;
  consultationFee: number;
  isAvailable: boolean;
  appointmentCount: number;
  departments: Array<{
    id: string;
    name: string;
  }>;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface AvailableSlots {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
  doctorName: string;
  specialization: string;
}

interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY' | 'ROUTINE_CHECKUP';
  reason: string;
  notes?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reason: string;
  notes?: string;
  patientName?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  consultationFee?: number;
}

interface UseAppointmentsOptions {
  onSuccess?: (appointment: Appointment) => void;
  onError?: (error: string) => void;
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots | null>(null);
  const [departmentDoctors, setDepartmentDoctors] = useState<Doctor[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  // Get doctors by department
  const getDoctorsByDepartment = useCallback(async (departmentId: string, date?: string) => {
    console.log('🔍 Fetching doctors for department:', departmentId, 'date:', date);
    console.log('🌐 API_BASE_URL:', API_BASE_URL);
    setIsLoading(true);
    setError(null);

    try {
      const params = date ? `?date=${date}` : '';
      const url = `${API_BASE_URL}/appointments/department/${departmentId}/doctors${params}`;
      console.log('📡 Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch doctors');
      }

      const doctors: Doctor[] = await response.json();
      console.log('✅ Doctors fetched:', doctors.length, doctors);
      setDepartmentDoctors(doctors);
      return doctors;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching doctors:', err);
      setError(errorMessage);
      toast({
        title: "Error Fetching Doctors",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Get available time slots for a doctor
  const getAvailableSlots = useCallback(async (doctorId: string, date: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/doctor/${doctorId}/available-slots?date=${date}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch available slots');
      }

      const slots: AvailableSlots = await response.json();
      setAvailableSlots(slots);
      return slots;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error Fetching Time Slots",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Create appointment
  const createAppointment = useCallback(async (appointmentData: CreateAppointmentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      const appointment: Appointment = await response.json();
      
      toast({
        title: "Appointment Created",
        description: `Appointment scheduled with ${appointment.doctorName} on ${new Date(appointment.date).toLocaleDateString()}`,
      });

      options.onSuccess?.(appointment);
      return appointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error Creating Appointment",
        description: errorMessage,
        variant: "destructive",
      });

      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, options]);

  // Create appointment with OPD visit
  const createAppointmentWithOPD = useCallback(async (appointmentData: CreateAppointmentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/book-with-opd`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment with OPD');
      }

      const appointment: Appointment = await response.json();
      
      toast({
        title: "Appointment Booked with OPD Visit",
        description: `Appointment scheduled with ${appointment.doctorName}`,
      });

      options.onSuccess?.(appointment);
      return appointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error Creating Appointment",
        description: errorMessage,
        variant: "destructive",
      });

      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, options]);

  // Get appointments by doctor
  const getAppointmentsByDoctor = useCallback(async (doctorId: string, date?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = date ? `?date=${date}` : '';
      const response = await fetch(
        `${API_BASE_URL}/appointments/doctor/${doctorId}${params}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }

      const doctorAppointments: Appointment[] = await response.json();
      setAppointments(doctorAppointments);
      return doctorAppointments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error Fetching Appointments",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Get all appointments with filters (including OPD visits)
  const getAppointments = useCallback(async (filters: {
    page?: number;
    limit?: number;
    status?: string;
    doctorId?: string;
    patientId?: string;
    includeOPD?: boolean;
  } = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.doctorId) params.append('doctorId', filters.doctorId);
      if (filters.patientId) params.append('patientId', filters.patientId);

      // Fetch both regular appointments and OPD visits
      const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const appointmentsResult = appointmentsResponse.ok ? await appointmentsResponse.json() : { appointments: [] };
      let opdResult = { appointments: [], total: 0 };

      // Fetch OPD visits if requested
      if (filters.includeOPD !== false) {
        try {
          const opdVisitsResponse = await fetch(`${API_BASE_URL}/appointments/opd-visits?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });
          if (opdVisitsResponse.ok) {
            opdResult = await opdVisitsResponse.json();
          }
        } catch (opdError) {
          console.log('OPD visits fetch failed, continuing with regular appointments only');
        }
      }

      // Combine appointments and OPD visits
      const allAppointments = [
        ...(appointmentsResult.appointments || []),
        ...(opdResult.appointments || [])
      ].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setAppointments(allAppointments);
      
      return {
        appointments: allAppointments,
        total: (appointmentsResult.total || 0) + (opdResult.total || 0),
        page: filters.page || 1,
        limit: filters.limit || 10,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error Fetching Appointments",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  return {
    // State
    isLoading,
    error,
    appointments,
    availableSlots,
    departmentDoctors,
    
    // Actions
    getDoctorsByDepartment,
    getAvailableSlots,
    createAppointment,
    createAppointmentWithOPD,
    getAppointmentsByDoctor,
    getAppointments,
    
    // Setters
    setAppointments,
    setAvailableSlots,
    setDepartmentDoctors,
  };
}

export type { Doctor, TimeSlot, AvailableSlots, CreateAppointmentData, Appointment };