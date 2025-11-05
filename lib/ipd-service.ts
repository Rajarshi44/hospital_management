import { ApiClient } from './api-client';

// IPD API Types based on backend DTOs
export interface CreateAdmissionDto {
  patientId?: string;
  patientData?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    address: string;
    bloodGroup?: string;
    allergies?: string;
    medicalHistory?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
  };
  doctorId: string;
  bedId: string;
  admissionDate?: string;
  admissionTime?: string;
  admissionType: 'EMERGENCY' | 'ELECTIVE' | 'REFERRAL';
  category?: string;
  referralSource?: string;
  referredBy?: string;
  chiefComplaint: string;
  presentIllness?: string;
  pastHistory?: string;
  familyHistory?: string;
  personalHistory?: string;
  generalCondition?: string;
  consciousness?: string;
  provisionalDiagnosis?: string;
  finalDiagnosis?: string;
  treatmentPlan?: string;
  expectedDischargeDate?: string;
  estimatedCost?: number;
  depositAmount?: number;
  emergencyContact?: string;
  insuranceDetails?: string;
  notes?: string;
}

export interface CreateDischargeDto {
  admissionId: string;
  doctorId: string;
  dischargeDate?: string;
  dischargeTime?: string;
  dischargeType?: string;
  finalDiagnosis: string;
  treatmentSummary?: string;
  conditionAtDischarge?: string;
  followUpInstructions?: string;
  followUpDate?: string;
  restrictions?: string;
  notes?: string;
  medications?: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
}

export interface CreateTransferDto {
  admissionId: string;
  toBedId: string;
  reason: string;
  approvedBy: string;
  transferDate?: string;
  transferTime?: string;
  notes?: string;
}

export interface CreateTreatmentDto {
  admissionId: string;
  doctorId: string;
  type: 'MEDICATION' | 'PROCEDURE' | 'THERAPY' | 'INVESTIGATION';
  description: string;
  medication?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface CreateVitalsDto {
  admissionId: string;
  recordedBy: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  urinOutput?: number;
  fluidIntake?: number;
  painScale?: number;
  shift?: string;
  recordedAt?: string;
  notes?: string;
}

export interface CreateWardDto {
  wardNumber: string;
  name: string;
  type: 'GENERAL' | 'ICU' | 'NICU' | 'CCU' | 'EMERGENCY';
  departmentId: string;
  totalBeds: number;
  floor?: string;
  description?: string;
}

export interface CreateBedDto {
  bedNumber: string;
  bedType?: string;
  dailyRate?: number;
}

export class IPDService {
  // Admissions
  static async createAdmission(data: CreateAdmissionDto) {
    return ApiClient.post('/ipd/admissions', data);
  }

  static async getAdmissions(filters?: {
    patientId?: string;
    doctorId?: string;
    wardId?: string;
    status?: string;
    admissionDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/admissions${query}`);
  }

  static async getAdmission(id: string) {
    return ApiClient.get(`/ipd/admissions/${id}`);
  }

  static async updateAdmission(id: string, data: Partial<CreateAdmissionDto>) {
    return ApiClient.patch(`/ipd/admissions/${id}`, data);
  }

  // Discharge
  static async createDischarge(data: CreateDischargeDto) {
    return ApiClient.post('/ipd/discharge', data);
  }

  static async getDischarges(filters?: {
    patientId?: string;
    doctorId?: string;
    dischargeDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/discharge${query}`);
  }

  static async getDischarge(id: string) {
    return ApiClient.get(`/ipd/discharge/${id}`);
  }

  static async getDischargeByAdmission(admissionId: string) {
    return ApiClient.get(`/ipd/discharge/admission/${admissionId}`);
  }

  static async prepareDischarge(admissionId: string) {
    return ApiClient.post(`/ipd/discharge/${admissionId}/prepare-discharge`, {});
  }

  // Transfers
  static async createTransfer(data: CreateTransferDto) {
    return ApiClient.post('/ipd/transfers', data);
  }

  static async getTransfers(filters?: {
    admissionId?: string;
    patientId?: string;
    wardId?: string;
    transferDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/transfers${query}`);
  }

  static async getTransfersByAdmission(admissionId: string) {
    return ApiClient.get(`/ipd/transfers/admission/${admissionId}`);
  }

  static async getAvailableBeds(wardId: string) {
    return ApiClient.get(`/ipd/transfers/available-beds/${wardId}`);
  }

  // Treatments
  static async createTreatment(data: CreateTreatmentDto) {
    return ApiClient.post('/ipd/treatments', data);
  }

  static async getTreatments(filters?: {
    admissionId?: string;
    patientId?: string;
    doctorId?: string;
    type?: string;
    status?: string;
    startDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/treatments${query}`);
  }

  static async getTreatmentsByAdmission(admissionId: string) {
    return ApiClient.get(`/ipd/treatments/admission/${admissionId}`);
  }

  static async updateTreatmentStatus(id: string, status: string, endDate?: string, notes?: string) {
    return ApiClient.patch(`/ipd/treatments/${id}/status`, { status, endDate, notes });
  }

  // Vitals
  static async createVitals(data: CreateVitalsDto) {
    return ApiClient.post('/ipd/vitals', data);
  }

  static async getVitals(filters?: {
    admissionId?: string;
    patientId?: string;
    recordedBy?: string;
    shift?: string;
    recordedDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/vitals${query}`);
  }

  static async getVitalsByAdmission(admissionId: string) {
    return ApiClient.get(`/ipd/vitals/admission/${admissionId}`);
  }

  static async getLatestVitals(admissionId: string) {
    return ApiClient.get(`/ipd/vitals/admission/${admissionId}/latest`);
  }

  static async getVitalsChart(admissionId: string) {
    return ApiClient.get(`/ipd/vitals/admission/${admissionId}/charts`);
  }

  // Wards
  static async createWard(data: CreateWardDto) {
    return ApiClient.post('/ipd/wards', data);
  }

  static async getWards(filters?: {
    departmentId?: string;
    type?: string;
    isActive?: boolean;
    hasAvailableBeds?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const endpoint = `/ipd/wards${query}`;
    
    return ApiClient.get(endpoint);
  }

  static async getWard(id: string) {
    return ApiClient.get(`/ipd/wards/${id}`);
  }

  static async updateWard(id: string, data: Partial<CreateWardDto>) {
    return ApiClient.patch(`/ipd/wards/${id}`, data);
  }

  static async deleteWard(id: string) {
    return ApiClient.delete(`/ipd/wards/${id}`);
  }

  static async getWardAvailability(wardId: string) {
    return ApiClient.get(`/ipd/wards/${wardId}/availability`);
  }

  static async getDepartmentAvailability(departmentId: string) {
    return ApiClient.get(`/ipd/wards/department/${departmentId}/availability`);
  }

  static async getAllAvailableBeds(filters?: {
    wardType?: string;
    bedType?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/wards/available-beds/all${query}`);
  }

  // Beds
  static async createBed(wardId: string, data: CreateBedDto) {
    return ApiClient.post(`/ipd/wards/${wardId}/beds`, data);
  }

  static async getBedsByWard(wardId: string, filters?: {
    isOccupied?: boolean;
    bedType?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/wards/${wardId}/beds${query}`);
  }

  static async getBed(bedId: string) {
    return ApiClient.get(`/ipd/wards/beds/${bedId}`);
  }

  static async updateBed(bedId: string, data: Partial<CreateBedDto>) {
    return ApiClient.patch(`/ipd/wards/beds/${bedId}`, data);
  }

  // Dashboard & Analytics
  static async getDashboard() {
    return ApiClient.get('/ipd/dashboard');
  }

  static async getCurrentCensus(filters?: {
    wardId?: string;
    departmentId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/census${query}`);
  }

  static async getIpdOverview() {
    return ApiClient.get('/ipd/overview');
  }

  static async getStatistics(filters?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/ipd/statistics${query}`);
  }
}