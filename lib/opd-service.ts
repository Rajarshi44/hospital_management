/**
 * OPD Service
 * Handles OPD visit operations, draft management, and API integration
 */

import { ApiClient } from "./api-client";
import type { OPDVisitForm, OPDDraft } from "./opd-types";
import { mockOPDVisits, generateVisitId } from "./opd-mock-data";

const DRAFT_KEY_PREFIX = "opd-draft-";

export class OPDService {
  private static instance: OPDService;

  private constructor() {}

  static getInstance(): OPDService {
    if (!OPDService.instance) {
      OPDService.instance = new OPDService();
    }
    return OPDService.instance;
  }

  /**
   * Create a new OPD visit
   */
  async createVisit(visit: OPDVisitForm): Promise<OPDVisitForm> {
    try {
      // In production, this would call the API
      // const response = await ApiClient.post<OPDVisitForm>("/opd/visits", visit);
      // return response;

      // Mock implementation
      const now = new Date().toISOString();
      const newVisit: OPDVisitForm = {
        ...visit,
        visit: {
          ...visit.visit,
          visitId: visit.visit.visitId || generateVisitId(),
        },
        metadata: {
          ...visit.metadata,
          createdAt: now,
          modifiedAt: now,
        },
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return newVisit;
    } catch (error) {
      console.error("Error creating OPD visit:", error);
      throw new Error("Failed to create OPD visit");
    }
  }

  /**
   * Update an existing OPD visit
   */
  async updateVisit(visitId: string, visit: Partial<OPDVisitForm>): Promise<OPDVisitForm> {
    try {
      // In production, this would call the API
      // const response = await ApiClient.patch<OPDVisitForm>(`/opd/visits/${visitId}`, visit);
      // return response;

      // Mock implementation
      const now = new Date().toISOString();
      const updatedVisit: OPDVisitForm = {
        ...visit,
        metadata: {
          ...visit.metadata,
          modifiedAt: now,
        },
      } as OPDVisitForm;

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return updatedVisit;
    } catch (error) {
      console.error("Error updating OPD visit:", error);
      throw new Error("Failed to update OPD visit");
    }
  }

  /**
   * Get a visit by ID
   */
  async getVisitById(visitId: string): Promise<OPDVisitForm | null> {
    try {
      // In production, this would call the API
      // const response = await ApiClient.get<OPDVisitForm>(`/opd/visits/${visitId}`);
      // return response;

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockOPDVisits.find((v) => v.visit.visitId === visitId) || null;
    } catch (error) {
      console.error("Error fetching OPD visit:", error);
      throw new Error("Failed to fetch OPD visit");
    }
  }

  /**
   * Get all visits for a patient
   */
  async getPatientVisits(patientId: string): Promise<OPDVisitForm[]> {
    try {
      // In production, this would call the API
      // const response = await ApiClient.get<OPDVisitForm[]>(`/opd/visits?patientId=${patientId}`);
      // return response;

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockOPDVisits.filter((v) => v.registration.patientId === patientId);
    } catch (error) {
      console.error("Error fetching patient visits:", error);
      throw new Error("Failed to fetch patient visits");
    }
  }

  /**
   * Get all OPD visits (with optional filters)
   */
  async getAllVisits(filters?: {
    department?: string;
    doctorId?: string;
    date?: string;
    status?: string;
  }): Promise<OPDVisitForm[]> {
    try {
      // In production, this would call the API with query params
      // const params = new URLSearchParams(filters as any);
      // const response = await ApiClient.get<OPDVisitForm[]>(`/opd/visits?${params}`);
      // return response;

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 300));
      let visits = [...mockOPDVisits];

      if (filters?.department) {
        visits = visits.filter((v) => v.visit.department === filters.department);
      }
      if (filters?.doctorId) {
        visits = visits.filter((v) => v.visit.consultingDoctor === filters.doctorId);
      }
      if (filters?.status) {
        visits = visits.filter((v) => v.visit.visitStatus === filters.status);
      }

      return visits;
    } catch (error) {
      console.error("Error fetching OPD visits:", error);
      throw new Error("Failed to fetch OPD visits");
    }
  }

  /**
   * Save draft to localStorage
   */
  saveDraft(userId: string, formData: Partial<OPDVisitForm>): void {
    try {
      const draft: OPDDraft = {
        formData,
        timestamp: new Date().toISOString(),
        userId,
      };

      localStorage.setItem(`${DRAFT_KEY_PREFIX}${userId}`, JSON.stringify(draft));
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }

  /**
   * Load draft from localStorage
   */
  loadDraft(userId: string): OPDDraft | null {
    try {
      const draftJson = localStorage.getItem(`${DRAFT_KEY_PREFIX}${userId}`);
      if (!draftJson) return null;

      const draft: OPDDraft = JSON.parse(draftJson);
      return draft;
    } catch (error) {
      console.error("Error loading draft:", error);
      return null;
    }
  }

  /**
   * Clear draft from localStorage
   */
  clearDraft(userId: string): void {
    try {
      localStorage.removeItem(`${DRAFT_KEY_PREFIX}${userId}`);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }

  /**
   * Check if draft exists
   */
  hasDraft(userId: string): boolean {
    try {
      return localStorage.getItem(`${DRAFT_KEY_PREFIX}${userId}`) !== null;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const opdService = OPDService.getInstance();
