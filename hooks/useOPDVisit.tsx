"use client";

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { OPDVisitForm } from '@/lib/opd-types';
import { useAppointments, type CreateAppointmentData } from './useAppointments';

// Types for API responses
interface OPDPatientData {
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone: string;
    age: number;
    gender: string;
    dateOfBirth: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    bloodGroup?: string;
    allergies?: string;
    guardianName?: string;
    guardianRelation?: string;
    occupation?: string;
    idProofType?: string;
    idProofNumber?: string;
    patientType: string;
    emergencyContact: {
      name?: string;
      phone?: string;
      relationship?: string;
    };
    insurance: {
      provider?: string;
      policyNumber?: string;
    };
    medicalHistory: {
      chronicConditions?: string;
      currentMedications?: string;
    };
  };
  visit: {
    id: string;
    visitId: string;
    visitDate: string;
    visitTime: string;
    visitType: string;
    appointmentMode: string;
    referralSource: string;
    referredBy?: string;
    priority: string;
    status: string;
    isFollowUp: boolean;
    followUpDate?: string;
    followUpInstructions?: string;
  };
  clinical: {
    chiefComplaint: string;
    historyOfPresentIllness?: string;
    pastMedicalHistory?: string;
    familyHistory?: string;
    socialHistory?: string;
    generalExamination?: string;
    systemicExamination?: string;
    provisionalDiagnosis?: string;
    finalDiagnosis?: string;
    treatmentPlan?: string;
    symptoms?: string;
    notes?: string;
  };
  doctor: {
    id: string;
    doctorId: string;
    name: string;
    specialization?: string;
    phone?: string;
    email?: string;
    departments: string[];
  };
  department: {
    id: string;
    name: string;
    description?: string;
  };
  vitals: Array<{
    id: string;
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    recordedAt: string;
    recordedBy: string;
    notes?: string;
  }>;
  prescriptions: Array<{
    id: string;
    drugName: string;
    strength?: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    instructions?: string;
    notes?: string;
    quantity?: number;
    isGeneric: boolean;
    prescribedBy?: string;
    prescribedAt: string;
  }>;
  investigations: Array<{
    id: string;
    testName: string;
    testType: string;
    urgency: string;
    instructions?: string;
    status: string;
    orderedBy: string;
    orderedAt: string;
  }>;
  billing?: {
    id: string;
    consultationFee: number;
    additionalCharges: number;
    discount: number;
    tax: number;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod?: string;
    paidAmount: number;
    balanceAmount: number;
    transactionId?: string;
    paymentDate?: string;
    notes?: string;
  };
  followUpVisits: Array<{
    id: string;
    visitId: string;
    visitDate: string;
    status: string;
    doctor: string;
    chiefComplaint: string;
  }>;
  ipdData: {
    hasAdmissions: boolean;
    admissions: any[];
    note: string;
  };
}

interface ComprehensivePatientResponse {
  data: OPDPatientData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface CreateOPDVisitResponse {
  id: string;
  visitId: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  message: string;
}

interface UseOPDVisitOptions {
  onSuccess?: (visitId: string) => void;
  onError?: (error: string) => void;
}

export function useOPDVisit(options: UseOPDVisitOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comprehensiveData, setComprehensiveData] = useState<OPDPatientData[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // Use appointments hook for creating appointments
  const { createAppointmentWithOPD } = useAppointments();

  // Helper function to calculate end time (30 minutes after start time)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // Add 30 minutes
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  // Transform frontend form data to backend API format
  const transformFormToAPI = (formData: OPDVisitForm) => {
    return {
      // Patient data (for auto-creation)
      patientData: {
        firstName: formData.registration.firstName,
        lastName: formData.registration.lastName || '',
        email: formData.registration.email,
        phone: formData.registration.phone,
        dateOfBirth: new Date(Date.now() - formData.registration.age * 365.25 * 24 * 60 * 60 * 1000).toISOString(),
        gender: formData.registration.gender,
        address: formData.registration.address || '',
        city: '', // Add if available in form
        state: '', // Add if available in form
        zipCode: '', // Add if available in form
        bloodGroup: formData.registration.bloodGroup,
        allergies: formData.registration.knownAllergies,
        guardianName: formData.registration.guardianName,
        guardianRelation: formData.registration.guardianRelation,
        occupation: formData.registration.occupation,
        idProofType: formData.registration.idProofType,
        idProofNumber: formData.registration.idProofNumber,
        patientType: formData.registration.patientType,
        emergencyContactName: '', // Add if available
        emergencyContactPhone: '', // Add if available
        emergencyContactRelationship: '', // Add if available
      },

      // Visit data
      departmentId: formData.visit.department, // This might need department ID lookup
      doctorId: formData.visit.consultingDoctor,
      visitDate: formData.visit.visitDate,
      visitTime: formData.visit.appointmentSlot || new Date().toTimeString().slice(0, 5),
      visitType: formData.visit.visitType,
      appointmentMode: formData.visit.appointmentMode,
      referralSource: formData.visit.referralSource,
      priority: formData.visit.visitPriority,
      
      // Clinical data
      chiefComplaint: formData.clinical.chiefComplaint,
      historyOfPresentIllness: formData.clinical.historyOfPresentIllness,
      pastMedicalHistory: formData.clinical.pastMedicalHistory,
      familyHistory: formData.clinical.familyHistory,
      socialHistory: formData.clinical.personalHistory,
      generalExamination: formData.clinical.generalExamination,
      systemicExamination: formData.clinical.systemicExamination,
      
      // Diagnosis
      provisionalDiagnosis: formData.diagnosis.provisionalDiagnosis,
      finalDiagnosis: formData.diagnosis.finalDiagnosis,
      
      // Follow-up
      followUpDate: formData.followUp?.followUpDate,
      followUpInstructions: formData.followUp?.followUpInstructions,
      
      // Vitals
      vitals: {
        bloodPressure: formData.vitals.bloodPressure,
        heartRate: formData.vitals.pulseRate,
        temperature: formData.vitals.temperature,
        respiratoryRate: formData.vitals.respiratoryRate,
        oxygenSaturation: formData.vitals.spo2,
        weight: formData.vitals.weightKg,
        height: formData.vitals.heightCm,
        bmi: formData.vitals.bmi,
        notes: formData.vitals.weightNote,
        recordedBy: 'system', // This should come from current user
      },
      
      // Prescriptions
      prescriptions: formData.treatment.prescriptionList.map(prescription => ({
        drugName: prescription.drugName,
        strength: prescription.strength,
        dosage: prescription.dose,
        frequency: prescription.frequency,
        duration: prescription.duration,
        route: prescription.route,
        instructions: prescription.instructions,
        notes: prescription.notes,
        // prescribingDoctor will be set by backend
      })),
      
      // Investigations
      investigations: [
        ...(formData.investigations?.recommendedLabTests || []).map(test => ({
          testName: test,
          testType: 'LAB',
          urgency: formData.investigations?.investigationUrgency || 'ROUTINE',
        })),
        ...(formData.investigations?.radiologyTests || []).map(test => ({
          testName: test,
          testType: 'RADIOLOGY',
          urgency: formData.investigations?.investigationUrgency || 'ROUTINE',
        })),
      ],
      
      // Billing
      billing: {
        consultationFee: formData.billing.consultationFee,
        additionalCharges: formData.billing.investigationEstimate || 0,
        discount: formData.billing.discountAmount || 0,
        tax: 0, // Calculate if needed
        paymentMethod: formData.billing.paymentMode,
        paidAmount: formData.billing.paymentStatus === 'Paid' ? 
          (formData.billing.totalPayable - (formData.billing.discountAmount || 0)) : 0,
      },
    };
  };

  // Create OPD visit with auto patient creation
  const createOPDVisit = useCallback(async (formData: OPDVisitForm): Promise<string> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const apiData = transformFormToAPI(formData);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      const response = await fetch(`${API_BASE_URL}/opd/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create OPD visit');
      }

      const result: CreateOPDVisitResponse = await response.json();
      
      // If appointment slot is selected, create appointment
      if (formData.visit.appointmentSlot && formData.visit.consultingDoctor) {
        try {
          const appointmentData: CreateAppointmentData = {
            patientId: result.patient.id,
            doctorId: formData.visit.consultingDoctor,
            date: formData.visit.visitDate,
            startTime: formData.visit.appointmentSlot,
            endTime: calculateEndTime(formData.visit.appointmentSlot), // Calculate end time
            type: formData.visit.visitType === 'EMERGENCY' ? 'EMERGENCY' : 'CONSULTATION',
            reason: formData.clinical.chiefComplaint || 'OPD Consultation',
            notes: `OPD Visit: ${result.visitId}`,
          };

          await createAppointmentWithOPD(appointmentData);
        } catch (appointmentError) {
          console.warn('Failed to create appointment:', appointmentError);
          // Don't fail the entire OPD creation for appointment errors
          toast({
            title: "OPD Visit Created",
            description: `Visit created successfully but appointment booking failed. Visit ID: ${result.visitId}`,
            variant: "default",
          });
        }
      }
      
      toast({
        title: "OPD Visit Created Successfully",
        description: `Visit ID: ${result.visitId} for patient ${result.patient.firstName} ${result.patient.lastName}`,
      });

      options.onSuccess?.(result.visitId);
      return result.visitId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error Creating OPD Visit",
        description: errorMessage,
        variant: "destructive",
      });

      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [options]);

  // Get comprehensive patient data
  const getComprehensivePatientData = useCallback(async (filters: {
    search?: string;
    date?: string;
    department?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.date) params.append('date', filters.date);
      if (filters.department) params.append('department', filters.department);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const response = await fetch(`${API_BASE_URL}/opd/visits/patients/comprehensive?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch patient data');
      }

      const result: ComprehensivePatientResponse = await response.json();
      
      setComprehensiveData(result.data);
      setPagination(result.pagination);
      
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error Fetching Patient Data",
        description: errorMessage,
        variant: "destructive",
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get specific OPD visit
  const getOPDVisit = useCallback(async (visitId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const response = await fetch(`${API_BASE_URL}/opd/visits/${visitId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch OPD visit');
      }

      const result = await response.json();
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error Fetching OPD Visit",
        description: errorMessage,
        variant: "destructive",
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    isSubmitting,
    error,
    comprehensiveData,
    pagination,
    
    // Actions
    createOPDVisit,
    getComprehensivePatientData,
    getOPDVisit,
    
    // Utils
    transformFormToAPI,
  };
}

export type { OPDPatientData, ComprehensivePatientResponse, CreateOPDVisitResponse };
