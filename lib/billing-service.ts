// Frontend Billing Service Integration
// File: /lib/billing-service.ts

export class BillingService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // OPD Billing Methods
  static async getAvailableOPDVisits(patientId?: string) {
    const params = patientId ? `?patientId=${patientId}` : '';
    const response = await fetch(`${this.baseUrl}/opd/available-visits${params}`);
    if (!response.ok) throw new Error('Failed to fetch available OPD visits');
    return response.json();
  }

  static async createOPDBill(billingData: any) {
    const response = await fetch(`${this.baseUrl}/opd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billingData),
    });
    if (!response.ok) throw new Error('Failed to create OPD bill');
    return response.json();
  }

  static async getOPDBills(filters?: any) {
    const params = new URLSearchParams(filters || {});
    const response = await fetch(`${this.baseUrl}/billing/opd?${params}`);
    if (!response.ok) throw new Error('Failed to fetch OPD bills');
    return response.json();
  }

  static async getOPDBill(billId: string) {
    const response = await fetch(`${this.baseUrl}/billing/opd/${billId}`);
    if (!response.ok) throw new Error('Failed to fetch OPD bill');
    return response.json();
  }

  static async updateOPDBill(billId: string, data: any) {
    const response = await fetch(`${this.baseUrl}/billing/opd/${billId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update OPD bill');
    return response.json();
  }

  static async recordOPDPayment(billId: string, payment: any) {
    const response = await fetch(`${this.baseUrl}/billing/opd/${billId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error('Failed to record OPD payment');
    return response.json();
  }

  // IPD Billing Methods
  static async createIPDBill(admissionId: string) {
    const response = await fetch(`${this.baseUrl}/billing/ipd/admission/${admissionId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to create IPD bill');
    return response.json();
  }

  static async getIPDBills(filters?: any) {
    const response = await fetch(`${this.baseUrl}/billing/ipd`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters || {}),
    });
    if (!response.ok) throw new Error('Failed to fetch IPD bills');
    return response.json();
  }

  static async getIPDBill(billId: string) {
    const response = await fetch(`${this.baseUrl}/billing/ipd/${billId}`);
    if (!response.ok) throw new Error('Failed to fetch IPD bill');
    return response.json();
  }

  static async updateIPDBillItems(billId: string, items: any[]) {
    const response = await fetch(`${this.baseUrl}/billing/ipd/${billId}/line-items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    if (!response.ok) throw new Error('Failed to update IPD bill items');
    return response.json();
  }

  static async finalizeIPDBill(billId: string) {
    const response = await fetch(`${this.baseUrl}/billing/ipd/${billId}/finalize`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to finalize IPD bill');
    return response.json();
  }

  static async recordIPDPayment(billId: string, payment: any) {
    const response = await fetch(`${this.baseUrl}/billing/ipd/${billId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error('Failed to record IPD payment');
    return response.json();
  }

  // Insurance & Claims Methods
  static async createClaim(claimData: any) {
    const response = await fetch(`${this.baseUrl}/billing/insurance/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData),
    });
    if (!response.ok) throw new Error('Failed to create insurance claim');
    return response.json();
  }

  static async getClaims(filters?: any) {
    const response = await fetch(`${this.baseUrl}/billing/insurance/claims`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters || {}),
    });
    if (!response.ok) throw new Error('Failed to fetch insurance claims');
    return response.json();
  }

  static async updateClaimStatus(claimId: string, status: string, data?: any) {
    const response = await fetch(`${this.baseUrl}/billing/insurance/claims/${claimId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...data }),
    });
    if (!response.ok) throw new Error('Failed to update claim status');
    return response.json();
  }

  static async recordAdvance(advanceData: any) {
    const response = await fetch(`${this.baseUrl}/billing/insurance/advances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(advanceData),
    });
    if (!response.ok) throw new Error('Failed to record advance payment');
    return response.json();
  }

  static async getAdvances(filters?: any) {
    const response = await fetch(`${this.baseUrl}/billing/insurance/advances`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters || {}),
    });
    if (!response.ok) throw new Error('Failed to fetch advance payments');
    return response.json();
  }

  static async applyAdvance(advanceId: string, billId: string, billType: string, amount: number) {
    const response = await fetch(`${this.baseUrl}/billing/insurance/advances/${advanceId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billId, billType, amount }),
    });
    if (!response.ok) throw new Error('Failed to apply advance payment');
    return response.json();
  }

  // Dashboard Methods
  static async getDashboardStats() {
    const response = await fetch(`${this.baseUrl}/billing/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  }

  static async getRevenueBySource(dateRange?: any) {
    const params = dateRange ? new URLSearchParams(dateRange) : '';
    const response = await fetch(`${this.baseUrl}/billing/dashboard/revenue-by-source?${params}`);
    if (!response.ok) throw new Error('Failed to fetch revenue by source');
    return response.json();
  }

  static async getOutstandingReceivables() {
    // This would be implemented as part of dashboard stats
    const stats = await this.getDashboardStats();
    return stats.outstandingAmount || 0;
  }

  static async getRecentTransactions(filters?: any) {
    // Get recent payments from both OPD and IPD
    const [opdBills, ipdBills] = await Promise.all([
      this.getOPDBills({ ...filters, limit: 10 }),
      this.getIPDBills({ ...filters, limit: 10 })
    ]);

    const transactions = [
      ...opdBills.bills.map((bill: any) => ({
        ...bill,
        type: 'OPD',
        amount: bill.totalAmount,
        date: bill.billDate
      })),
      ...ipdBills.bills.map((bill: any) => ({
        ...bill,
        type: 'IPD',
        amount: bill.totalAmount,
        date: bill.billDate
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return transactions.slice(0, 10);
  }

  // Revenue calculation methods
  static async getRevenueStatistics() {
    const [opdStats, dashboardStats] = await Promise.all([
      fetch(`${this.baseUrl}/billing/opd/statistics/dashboard`).then(r => r.json()),
      this.getDashboardStats()
    ]);

    return {
      today: {
        opd: opdStats.todayRevenue || 0,
        ipd: dashboardStats.ipdRevenue || 0,
        total: (opdStats.todayRevenue || 0) + (dashboardStats.ipdRevenue || 0)
      },
      monthly: {
        opd: opdStats.monthlyRevenue || 0,
        ipd: dashboardStats.ipdRevenue || 0,
        total: (opdStats.monthlyRevenue || 0) + (dashboardStats.ipdRevenue || 0)
      },
      outstanding: opdStats.outstandingAmount || 0
    };
  }
}

export default BillingService;