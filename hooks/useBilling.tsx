import { useState, useEffect, useCallback } from 'react';
import BillingService from '@/lib/billing-service';

// Types for billing data
interface BillData {
  id: string;
  patientId: string;
  amount: number;
  status: string;
  [key: string]: any;
}

interface DashboardStats {
  totalRevenue: number;
  pendingBills: number;
  todayRevenue: number;
  [key: string]: any;
}

// OPD Billing Hooks
export function useOPDBills(filters?: any) {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const response = await BillingService.getOPDBills(filters);
      setBills(response.bills || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch OPD bills');
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return { data: bills, loading, error, refetch: fetchBills };
}

export function useOPDBill(billId: string) {
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBill = useCallback(async () => {
    if (!billId) return;
    
    try {
      setLoading(true);
      const response = await BillingService.getOPDBill(billId);
      setBill(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bill');
      setBill(null);
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  return { data: bill, loading, error, refetch: fetchBill };
}

// IPD Billing Hooks
export function useIPDBills(filters?: any) {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const response = await BillingService.getIPDBills(filters);
      setBills(response.bills || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IPD bills');
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return { data: bills, loading, error, refetch: fetchBills };
}

// Insurance Claims Hook
export function useInsuranceClaims(filters?: any) {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const response = await BillingService.getClaims(filters);
      setClaims(response.claims || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return { data: claims, loading, error, refetch: fetchClaims };
}

// Available OPD Visits Hook
export function useAvailableOPDVisits(patientId?: string) {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await BillingService.getAvailableOPDVisits(patientId);
      setVisits(response.visits || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch OPD visits');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return { data: visits, loading, error, refetch: fetchVisits };
}

// Dashboard Hook
export function useBillingDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await BillingService.getDashboardStats();
      setStats(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { data: stats, loading, error, refetch: fetchStats };
}

// Main Billing Hook for common operations
export function useBilling() {
  const { data: opdBills, loading: opdLoading, error: opdError, refetch: refetchOPD } = useOPDBills();
  const { data: ipdBills, loading: ipdLoading, error: ipdError, refetch: refetchIPD } = useIPDBills();
  const { data: claims, loading: claimsLoading, error: claimsError, refetch: refetchClaims } = useInsuranceClaims();
  const { data: dashboardStats, loading: dashLoading, error: dashError, refetch: refetchDash } = useBillingDashboard();

  // Action functions
  const createOPDBill = async (billingData: any) => {
    try {
      const result = await BillingService.createOPDBill(billingData);
      refetchOPD();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateOPDBill = async (billId: string, data: any) => {
    try {
      const result = await BillingService.updateOPDBill(billId, data);
      refetchOPD();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const recordOPDPayment = async (billId: string, payment: any) => {
    try {
      const result = await BillingService.recordOPDPayment(billId, payment);
      refetchOPD();
      refetchDash();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const createIPDBill = async (admissionId: string) => {
    try {
      const result = await BillingService.createIPDBill(admissionId);
      refetchIPD();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateIPDBillItems = async (billId: string, items: any[]) => {
    try {
      const result = await BillingService.updateIPDBillItems(billId, items);
      refetchIPD();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const finalizeIPDBill = async (billId: string) => {
    try {
      const result = await BillingService.finalizeIPDBill(billId);
      refetchIPD();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const recordIPDPayment = async (billId: string, payment: any) => {
    try {
      const result = await BillingService.recordIPDPayment(billId, payment);
      refetchIPD();
      refetchDash();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const createClaim = async (claimData: any) => {
    try {
      const result = await BillingService.createClaim(claimData);
      refetchClaims();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateClaimStatus = async (claimId: string, status: string, data?: any) => {
    try {
      const result = await BillingService.updateClaimStatus(claimId, status, data);
      refetchClaims();
      refetchOPD();
      refetchIPD();
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Data
    opdBills: opdBills || [],
    ipdBills: ipdBills || [],
    claims: claims || [],
    dashboardStats,

    // Loading states
    isLoading: opdLoading || ipdLoading || claimsLoading || dashLoading,
    opdLoading,
    ipdLoading,
    claimsLoading,
    dashLoading,

    // Error states
    opdError,
    ipdError,
    claimsError,
    dashError,

    // Actions
    createOPDBill,
    updateOPDBill,
    recordOPDPayment,
    createIPDBill,
    updateIPDBillItems,
    finalizeIPDBill,
    recordIPDPayment,
    createClaim,
    updateClaimStatus,

    // Refetch functions
    refetchAll: () => {
      refetchOPD();
      refetchIPD();
      refetchClaims();
      refetchDash();
    },
    refetchOPD,
    refetchIPD,
    refetchClaims,
    refetchDash,
  };
}