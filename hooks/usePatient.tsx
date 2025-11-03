"use client";

import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useOPDVisit, type OPDPatientData } from './useOPDVisit';

// Enhanced Patient type that includes OPD data
export interface EnhancedPatient {
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
  
  // Enhanced fields
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
  
  // OPD Data
  opdData: {
    totalVisits: number;
    lastVisitDate?: string;
    recentVisits: Array<{
      id: string;
      visitId: string;
      visitDate: string;
      doctor: string;
      department: string;
      status: string;
      chiefComplaint: string;
    }>;
    activePrescriptions: Array<{
      drugName: string;
      dosage: string;
      frequency: string;
      prescribedBy: string;
      prescribedAt: string;
    }>;
    pendingInvestigations: Array<{
      testName: string;
      testType: string;
      urgency: string;
      orderedAt: string;
    }>;
  };
  
  // IPD Data (placeholder for future implementation)
  ipdData: {
    hasAdmissions: boolean;
    currentAdmission?: {
      admissionDate: string;
      ward: string;
      bed: string;
      status: string;
    };
    admissionHistory: any[];
    note?: string;
  };
  
  // Summary stats
  summary: {
    lastVisitDate?: string;
    totalVisits: number;
    activePrescriptions: number;
    pendingInvestigations: number;
    outstandingBalance: number;
  };
}

interface UsePatientOptions {
  autoFetch?: boolean;
  refreshInterval?: number;
}

export function usePatient(options: UsePatientOptions = {}) {
  const { autoFetch = false, refreshInterval } = options;
  
  const [patients, setPatients] = useState<EnhancedPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<EnhancedPatient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: 'all',
    date: '',
    patientType: 'all',
  });

  const { getComprehensivePatientData, comprehensiveData, pagination } = useOPDVisit();

  // Transform OPD data to enhanced patient format
  const transformOPDDataToPatients = useCallback((opdData: OPDPatientData[]): EnhancedPatient[] => {
    // Group OPD visits by patient
    const patientMap = new Map<string, EnhancedPatient>();

    opdData.forEach((opdRecord) => {
      const patientId = opdRecord.patient.id;
      
      if (!patientMap.has(patientId)) {
        // Create new enhanced patient record
        const enhancedPatient: EnhancedPatient = {
          ...opdRecord.patient,
          opdData: {
            totalVisits: 0,
            recentVisits: [],
            activePrescriptions: [],
            pendingInvestigations: [],
          },
          ipdData: {
            hasAdmissions: false,
            admissionHistory: [],
            note: "IPD data integration pending",
          },
          summary: {
            totalVisits: 0,
            activePrescriptions: 0,
            pendingInvestigations: 0,
            outstandingBalance: 0,
          },
        };
        patientMap.set(patientId, enhancedPatient);
      }

      const patient = patientMap.get(patientId)!;
      
      // Update OPD data
      patient.opdData.totalVisits += 1;
      patient.opdData.recentVisits.push({
        id: opdRecord.visit.id,
        visitId: opdRecord.visit.visitId,
        visitDate: opdRecord.visit.visitDate,
        doctor: opdRecord.doctor.name,
        department: opdRecord.department.name,
        status: opdRecord.visit.status,
        chiefComplaint: opdRecord.clinical.chiefComplaint,
      });

      // Add active prescriptions (from last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      opdRecord.prescriptions.forEach((prescription) => {
        if (new Date(prescription.prescribedAt) > thirtyDaysAgo) {
          patient.opdData.activePrescriptions.push({
            drugName: prescription.drugName,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            prescribedBy: prescription.prescribedBy || 'Unknown',
            prescribedAt: prescription.prescribedAt,
          });
        }
      });

      // Add pending investigations
      opdRecord.investigations.forEach((investigation) => {
        if (investigation.status === 'ORDERED' || investigation.status === 'IN_PROGRESS') {
          patient.opdData.pendingInvestigations.push({
            testName: investigation.testName,
            testType: investigation.testType,
            urgency: investigation.urgency,
            orderedAt: investigation.orderedAt,
          });
        }
      });

      // Update summary
      if (!patient.summary.lastVisitDate || 
          new Date(opdRecord.visit.visitDate) > new Date(patient.summary.lastVisitDate)) {
        patient.summary.lastVisitDate = opdRecord.visit.visitDate;
        patient.opdData.lastVisitDate = opdRecord.visit.visitDate;
      }

      if (opdRecord.billing) {
        patient.summary.outstandingBalance += opdRecord.billing.balanceAmount || 0;
      }
    });

    // Sort visits and update counts
    patientMap.forEach((patient) => {
      patient.opdData.recentVisits.sort((a, b) => 
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      );
      patient.opdData.recentVisits = patient.opdData.recentVisits.slice(0, 5); // Keep only 5 recent visits
      
      patient.summary.totalVisits = patient.opdData.totalVisits;
      patient.summary.activePrescriptions = patient.opdData.activePrescriptions.length;
      patient.summary.pendingInvestigations = patient.opdData.pendingInvestigations.length;
    });

    return Array.from(patientMap.values());
  }, []);

  // Fetch all patients with comprehensive data
  const fetchPatients = useCallback(async (searchFilters?: {
    search?: string;
    date?: string;
    department?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getComprehensivePatientData({
        search: searchFilters?.search || searchQuery,
        date: searchFilters?.date || (filters.date || ''),
        department: searchFilters?.department || (filters.department === 'all' ? '' : filters.department),
        limit: searchFilters?.limit || 100, // Get more data for patient grouping
        offset: searchFilters?.offset || 0,
      });

      const enhancedPatients = transformOPDDataToPatients(result.data);
      setPatients(enhancedPatients);
      
      return enhancedPatients;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patients';
      setError(errorMessage);
      toast({
        title: "Error Fetching Patients",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getComprehensivePatientData, searchQuery, filters, transformOPDDataToPatients]);

  // Search patients
  const searchPatients = useCallback(async (query: string) => {
    setSearchQuery(query);
    return fetchPatients({ search: query });
  }, [fetchPatients]);

  // Apply filters
  const applyFilters = useCallback(async (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    return fetchPatients();
  }, [fetchPatients]);

  // Get patient by ID
  const getPatientById = useCallback(async (patientId: string): Promise<EnhancedPatient | null> => {
    const found = patients.find(p => p.id === patientId || p.patientId === patientId);
    if (found) {
      setSelectedPatient(found);
      return found;
    }

    // If not in current list, fetch from API
    try {
      const result = await getComprehensivePatientData({ search: patientId });
      if (result.data.length > 0) {
        const enhancedPatients = transformOPDDataToPatients(result.data);
        const patient = enhancedPatients[0];
        setSelectedPatient(patient);
        return patient;
      }
      return null;
    } catch (err) {
      console.error('Error fetching patient by ID:', err);
      return null;
    }
  }, [patients, getComprehensivePatientData, transformOPDDataToPatients]);

  // Select patient
  const selectPatient = useCallback((patient: EnhancedPatient | null) => {
    setSelectedPatient(patient);
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchPatients();
  }, [fetchPatients]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchPatients();
    }
  }, [autoFetch, fetchPatients]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchPatients, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchPatients]);

  // Patient statistics
  const statistics = {
    total: patients.length,
    withRecentVisits: patients.filter(p => {
      if (!p.summary.lastVisitDate) return false;
      const lastVisit = new Date(p.summary.lastVisitDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastVisit > thirtyDaysAgo;
    }).length,
    withActivePrescriptions: patients.filter(p => p.summary.activePrescriptions > 0).length,
    withPendingInvestigations: patients.filter(p => p.summary.pendingInvestigations > 0).length,
    totalOutstandingBalance: patients.reduce((sum, p) => sum + p.summary.outstandingBalance, 0),
  };

  return {
    // Data
    patients,
    selectedPatient,
    pagination,
    statistics,
    
    // State
    isLoading,
    error,
    searchQuery,
    filters,
    
    // Actions
    fetchPatients,
    searchPatients,
    applyFilters,
    getPatientById,
    selectPatient,
    refresh,
    
    // Setters
    setSearchQuery,
    setFilters,
  };
}

// EnhancedPatient is already exported with the interface declaration
