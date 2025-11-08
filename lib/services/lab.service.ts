import { 
  LabTest, 
  LabOrder, 
  LabResult, 
  LabDepartment, 
  LabTemplate,
  CreateLabTestRequest,
  UpdateLabTestRequest,
  CreateLabOrderRequest,
  UpdateLabOrderStatusRequest,
  CreateLabResultRequest,
  UpdateLabResultRequest,
  VerifyLabResultRequest,
  CreateLabDepartmentRequest,
  CreateLabTemplateRequest,
  LabTestFilters,
  LabOrderFilters,
  DepartmentReportFilters
} from '../types/lab.types';

class LabService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/lab`
    : 'http://localhost:3001/lab';

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: 'Network error' 
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Test Management
  async getTests(filters: LabTestFilters = {}): Promise<LabTest[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return this.makeRequest<LabTest[]>(`/tests${queryString ? `?${queryString}` : ''}`);
  }

  async getTestById(id: string): Promise<LabTest> {
    return this.makeRequest<LabTest>(`/tests/${id}`);
  }

  async createTest(data: CreateLabTestRequest): Promise<LabTest> {
    return this.makeRequest<LabTest>('/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTest(id: string, data: UpdateLabTestRequest): Promise<LabTest> {
    return this.makeRequest<LabTest>(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTest(id: string): Promise<void> {
    return this.makeRequest<void>(`/tests/${id}`, {
      method: 'DELETE',
    });
  }

  // Department Management
  async getDepartments(): Promise<LabDepartment[]> {
    return this.makeRequest<LabDepartment[]>('/departments');
  }

  async createDepartment(data: CreateLabDepartmentRequest): Promise<LabDepartment> {
    return this.makeRequest<LabDepartment>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Template Management
  async getTemplates(): Promise<LabTemplate[]> {
    return this.makeRequest<LabTemplate[]>('/templates');
  }

  async createTemplate(data: CreateLabTemplateRequest): Promise<LabTemplate> {
    return this.makeRequest<LabTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Order Management
  async getOrders(filters: LabOrderFilters = {}): Promise<LabOrder[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return this.makeRequest<LabOrder[]>(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrderById(id: string): Promise<LabOrder> {
    return this.makeRequest<LabOrder>(`/orders/${id}`);
  }

  async createOrder(data: CreateLabOrderRequest): Promise<LabOrder> {
    return this.makeRequest<LabOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(
    id: string, 
    data: UpdateLabOrderStatusRequest
  ): Promise<LabOrder> {
    return this.makeRequest<LabOrder>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateOrderReport(id: string, report: string): Promise<LabOrder> {
    return this.makeRequest<LabOrder>(`/orders/${id}/report`, {
      method: 'PUT',
      body: JSON.stringify({ report }),
    });
  }

  // Result Management
  async getOrderResults(orderId: string): Promise<LabResult[]> {
    return this.makeRequest<LabResult[]>(`/orders/${orderId}/results`);
  }

  async addResult(
    orderId: string, 
    data: CreateLabResultRequest
  ): Promise<LabResult> {
    return this.makeRequest<LabResult>(`/orders/${orderId}/results`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateResult(
    id: string, 
    data: UpdateLabResultRequest
  ): Promise<LabResult> {
    return this.makeRequest<LabResult>(`/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async verifyResult(
    id: string, 
    data: VerifyLabResultRequest
  ): Promise<LabResult> {
    return this.makeRequest<LabResult>(`/results/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Report Generation
  async generatePatientReport(patientId: string): Promise<Blob> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseUrl}/reports/patient/${patientId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    return response.blob();
  }

  async generateOrderReport(orderId: string): Promise<Blob> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseUrl}/reports/order/${orderId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    return response.blob();
  }

  async generateDepartmentReport(filters: DepartmentReportFilters = {}): Promise<Blob> {
    const token = localStorage.getItem('authToken');
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    
    const response = await fetch(
      `${this.baseUrl}/reports/department${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    return response.blob();
  }

  // Utility method to download blob as file
  downloadReport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const labService = new LabService();