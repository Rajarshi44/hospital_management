import { useState, useEffect, useCallback } from 'react';
import { toast } from '../use-toast';

export interface Department {
  id: string;
  name: string;
  description?: string;
  location?: string;
  established?: string;
  headDoctorId?: string;
  headDoctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
    email: string;
  };
  doctorCount?: number;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  location?: string;
  established?: string;
  headDoctorId?: string;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.statusText}`);
      }

      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch departments';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const createDepartment = async (departmentData: CreateDepartmentDto): Promise<Department | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating department:', departmentData);

      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create department: ${response.statusText}`);
      }

      const newDepartment = await response.json();
      setDepartments(prev => [...prev, newDepartment]);
      
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });

      return newDepartment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create department';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id: string, departmentData: UpdateDepartmentDto): Promise<Department | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Updating department:', id, departmentData);

      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update department: ${response.statusText}`);
      }

      const updatedDepartment = await response.json();
      setDepartments(prev => prev.map(dept => dept.id === id ? updatedDepartment : dept));
      
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      });

      return updatedDepartment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update department';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete department: ${response.statusText}`);
      }

      setDepartments(prev => prev.filter(dept => dept.id !== id));
      
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete department';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignHeadDoctor = async (departmentId: string, doctorId: string): Promise<Department | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/head-doctor/${doctorId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to assign head doctor: ${response.statusText}`);
      }

      const updatedDepartment = await response.json();
      setDepartments(prev => prev.map(dept => dept.id === departmentId ? updatedDepartment : dept));
      
      toast({
        title: 'Success',
        description: 'Head of Department assigned successfully',
      });

      return updatedDepartment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign head doctor';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeHeadDoctor = async (departmentId: string): Promise<Department | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/head-doctor`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to remove head doctor: ${response.statusText}`);
      }

      const updatedDepartment = await response.json();
      setDepartments(prev => prev.map(dept => dept.id === departmentId ? updatedDepartment : dept));
      
      toast({
        title: 'Success',
        description: 'Head of Department removed successfully',
      });

      return updatedDepartment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove head doctor';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignHeadDoctor,
    removeHeadDoctor,
  };
};