'use client';

import { useState, useEffect, useCallback } from 'react';
import { IPDService } from '@/lib/ipd-service';
import { useToast } from '@/hooks/use-toast';

// Admissions Hook
export function useAdmissions(filters?: {
  patientId?: string;
  doctorId?: string;
  wardId?: string;
  status?: string;
  admissionDate?: string;
  limit?: number;
  offset?: number;
}) {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IPDService.getAdmissions(filters) as any;
      setAdmissions(data.admissions || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch admissions';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  const createAdmission = async (data: any) => {
    setLoading(true);
    try {
      const result = await IPDService.createAdmission(data);
      toast({
        title: 'Success',
        description: 'Patient admitted successfully',
      });
      await fetchAdmissions(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create admission';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAdmission = async (id: string, data: any) => {
    setLoading(true);
    try {
      const result = await IPDService.updateAdmission(id, data);
      toast({
        title: 'Success',
        description: 'Admission updated successfully',
      });
      await fetchAdmissions(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update admission';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAdmission = async (id: string) => {
    try {
      return await IPDService.getAdmission(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch admission';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  return {
    admissions,
    loading,
    error,
    createAdmission,
    updateAdmission,
    getAdmission,
    refetch: fetchAdmissions,
  };
}

// Discharge Hook
export function useDischarge() {
  const [discharges, setDischarges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDischarges = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await IPDService.getDischarges(filters) as any;
      setDischarges(data.discharges || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch discharges';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDischarge = async (data: any) => {
    setLoading(true);
    try {
      const result = await IPDService.createDischarge(data);
      toast({
        title: 'Success',
        description: 'Patient discharged successfully',
      });
      await fetchDischarges(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to discharge patient';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const prepareDischarge = async (admissionId: string) => {
    try {
      return await IPDService.prepareDischarge(admissionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to prepare discharge';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getDischargeByAdmission = async (admissionId: string) => {
    try {
      return await IPDService.getDischargeByAdmission(admissionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch discharge details';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    discharges,
    loading,
    error,
    createDischarge,
    prepareDischarge,
    getDischargeByAdmission,
    fetchDischarges,
  };
}

// Bed Transfer Hook
export function useBedTransfers() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransfers = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await IPDService.getTransfers(filters) as any;
      setTransfers(data.transfers || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transfers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransfer = async (data: any) => {
    setLoading(true);
    try {
      const result = await IPDService.createTransfer(data);
      toast({
        title: 'Success',
        description: 'Bed transfer completed successfully',
      });
      await fetchTransfers(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer bed';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBeds = async (wardId: string) => {
    try {
      return await IPDService.getAvailableBeds(wardId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available beds';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getTransfersByAdmission = async (admissionId: string) => {
    try {
      return await IPDService.getTransfersByAdmission(admissionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transfer history';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    transfers,
    loading,
    error,
    createTransfer,
    getAvailableBeds,
    getTransfersByAdmission,
    fetchTransfers,
  };
}

// Treatments Hook
export function useTreatments(filters?: {
  admissionId?: string;
  patientId?: string;
  doctorId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  limit?: number;
  offset?: number;
}) {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IPDService.getTreatments(filters) as any;
      setTreatments(data.treatments || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch treatments';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTreatment = async (data: any) => {
    setLoading(true);
    try {
      const result = await IPDService.createTreatment(data);
      toast({
        title: 'Success',
        description: 'Treatment recorded successfully',
      });
      await fetchTreatments(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record treatment';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTreatmentStatus = async (id: string, status: string, endDate?: string, notes?: string) => {
    setLoading(true);
    try {
      const result = await IPDService.updateTreatmentStatus(id, status, endDate, notes);
      toast({
        title: 'Success',
        description: 'Treatment status updated successfully',
      });
      await fetchTreatments(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update treatment status';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTreatmentsByAdmission = async (admissionId: string) => {
    try {
      return await IPDService.getTreatmentsByAdmission(admissionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch treatments';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  return {
    treatments,
    loading,
    error,
    createTreatment,
    updateTreatmentStatus,
    getTreatmentsByAdmission,
    refetch: fetchTreatments,
  };
}

// Vitals Hook
export function useVitals(filters?: {
  admissionId?: string;
  patientId?: string;
  recordedBy?: string;
  shift?: string;
  recordedDate?: string;
  limit?: number;
  offset?: number;
}) {
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVitals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IPDService.getVitals(filters) as any;
      setVitals(data.vitals || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vitals';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createVitals = async (data: any) => {
    setLoading(true);
    try {
      const result = await IPDService.createVitals(data);
      toast({
        title: 'Success',
        description: 'Vitals recorded successfully',
      });
      await fetchVitals(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record vitals';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getVitalsByAdmission = async (admissionId: string) => {
    try {
      return await IPDService.getVitalsByAdmission(admissionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vitals';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getLatestVitals = async (admissionId: string) => {
    try {
      return await IPDService.getLatestVitals(admissionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch latest vitals';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getVitalsChart = async (admissionId: string) => {
    try {
      return await IPDService.getVitalsChart(admissionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vitals chart';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  return {
    vitals,
    loading,
    error,
    createVitals,
    getVitalsByAdmission,
    getLatestVitals,
    getVitalsChart,
    refetch: fetchVitals,
  };
}

// Wards Hook
export function useWards(filters?: {
  departmentId?: string;
  type?: string;
  isActive?: boolean;
  hasAvailableBeds?: boolean;
}) {
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IPDService.getWards(filters) as any;
      const wardsArray = Array.isArray(data) ? data : data.wards || [];
      setWards(wardsArray);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wards';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createWard = async (data: any) => {
    setLoading(true);
    try {
      const result = await IPDService.createWard(data);
      toast({
        title: 'Success',
        description: 'Ward created successfully',
      });
      await fetchWards(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ward';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWard = async (id: string, data: any) => {
    setLoading(true);
    try {
      const result = await IPDService.updateWard(id, data);
      toast({
        title: 'Success',
        description: 'Ward updated successfully',
      });
      await fetchWards(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ward';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWard = async (id: string) => {
    setLoading(true);
    try {
      await IPDService.deleteWard(id);
      toast({
        title: 'Success',
        description: 'Ward deleted successfully',
      });
      await fetchWards(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ward';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getWard = async (id: string) => {
    try {
      return await IPDService.getWard(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ward details';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getWardAvailability = async (wardId: string) => {
    try {
      return await IPDService.getWardAvailability(wardId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ward availability';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getAllAvailableBeds = async (filters?: { wardType?: string; bedType?: string }) => {
    try {
      return await IPDService.getAllAvailableBeds(filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available beds';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  return {
    wards,
    loading,
    error,
    createWard,
    updateWard,
    deleteWard,
    getWard,
    getWardAvailability,
    getAllAvailableBeds,
    refetch: fetchWards,
  };
}

// Dashboard Hook
export function useIPDDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [census, setCensus] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IPDService.getDashboard() as any;
      setDashboard(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCensus = useCallback(async (filters?: { wardId?: string; departmentId?: string }) => {
    try {
      const data = await IPDService.getCurrentCensus(filters) as any;
      setCensus(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch census data';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await IPDService.getIpdOverview() as any;
      setOverview(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch overview data';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const fetchStatistics = useCallback(async (filters?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const data = await IPDService.getStatistics(filters) as any;
      setStatistics(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    census,
    overview,
    statistics,
    loading,
    error,
    fetchDashboard,
    fetchCensus,
    fetchOverview,
    fetchStatistics,
  };
}