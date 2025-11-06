'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { labService } from '@/lib/services/lab.service';
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
} from '@/lib/types/lab.types';

interface UseLabState {
  tests: LabTest[];
  orders: LabOrder[];
  results: LabResult[];
  departments: LabDepartment[];
  templates: LabTemplate[];
  selectedOrder: LabOrder | null;
  selectedTest: LabTest | null;
  loading: boolean;
  error: string | null;
}

export function useLab() {
  const { toast } = useToast();
  
  const [state, setState] = useState<UseLabState>({
    tests: [],
    orders: [],
    results: [],
    departments: [],
    templates: [],
    selectedOrder: null,
    selectedTest: null,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const showError = (message: string) => {
    setError(message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const showSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  // Test Management
  const fetchTests = useCallback(async (filters: LabTestFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const tests = await labService.getTests(filters);
      setState(prev => ({ ...prev, tests }));
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTestById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const test = await labService.getTestById(id);
      setState(prev => ({ ...prev, selectedTest: test }));
      return test;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch test');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTest = useCallback(async (data: CreateLabTestRequest) => {
    try {
      setLoading(true);
      const newTest = await labService.createTest(data);
      setState(prev => ({ 
        ...prev, 
        tests: [...prev.tests, newTest] 
      }));
      showSuccess('Test created successfully');
      return newTest;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create test');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTest = useCallback(async (id: string, data: UpdateLabTestRequest) => {
    try {
      setLoading(true);
      const updatedTest = await labService.updateTest(id, data);
      setState(prev => ({
        ...prev,
        tests: prev.tests.map(test => 
          test.id === id ? updatedTest : test
        ),
        selectedTest: prev.selectedTest?.id === id ? updatedTest : prev.selectedTest
      }));
      showSuccess('Test updated successfully');
      return updatedTest;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update test');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await labService.deleteTest(id);
      setState(prev => ({
        ...prev,
        tests: prev.tests.filter(test => test.id !== id),
        selectedTest: prev.selectedTest?.id === id ? null : prev.selectedTest
      }));
      showSuccess('Test deleted successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete test');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Department Management
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const departments = await labService.getDepartments();
      setState(prev => ({ ...prev, departments }));
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDepartment = useCallback(async (data: CreateLabDepartmentRequest) => {
    try {
      setLoading(true);
      const newDepartment = await labService.createDepartment(data);
      setState(prev => ({ 
        ...prev, 
        departments: [...prev.departments, newDepartment] 
      }));
      showSuccess('Department created successfully');
      return newDepartment;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create department');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Template Management
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const templates = await labService.getTemplates();
      setState(prev => ({ ...prev, templates }));
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data: CreateLabTemplateRequest) => {
    try {
      setLoading(true);
      const newTemplate = await labService.createTemplate(data);
      setState(prev => ({ 
        ...prev, 
        templates: [...prev.templates, newTemplate] 
      }));
      showSuccess('Template created successfully');
      return newTemplate;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Order Management
  const fetchOrders = useCallback(async (filters: LabOrderFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const orders = await labService.getOrders(filters);
      setState(prev => ({ ...prev, orders }));
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const order = await labService.getOrderById(id);
      setState(prev => ({ ...prev, selectedOrder: order }));
      return order;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch order');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (data: CreateLabOrderRequest) => {
    try {
      setLoading(true);
      const newOrder = await labService.createOrder(data);
      setState(prev => ({ 
        ...prev, 
        orders: [newOrder, ...prev.orders] 
      }));
      showSuccess('Lab order created successfully');
      return newOrder;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create order');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (
    id: string, 
    data: UpdateLabOrderStatusRequest
  ) => {
    try {
      setLoading(true);
      const updatedOrder = await labService.updateOrderStatus(id, data);
      setState(prev => ({
        ...prev,
        orders: prev.orders.map(order => 
          order.id === id ? updatedOrder : order
        ),
        selectedOrder: prev.selectedOrder?.id === id ? updatedOrder : prev.selectedOrder
      }));
      showSuccess('Order status updated successfully');
      return updatedOrder;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update order status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderReport = useCallback(async (id: string, report: string) => {
    try {
      setLoading(true);
      const updatedOrder = await labService.updateOrderReport(id, report);
      setState(prev => ({
        ...prev,
        orders: prev.orders.map(order => 
          order.id === id ? updatedOrder : order
        ),
        selectedOrder: prev.selectedOrder?.id === id ? updatedOrder : prev.selectedOrder
      }));
      showSuccess('Report updated successfully');
      return updatedOrder;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update report');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Result Management
  const fetchOrderResults = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      const results = await labService.getOrderResults(orderId);
      setState(prev => ({ ...prev, results }));
      return results;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch results');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addResult = useCallback(async (
    orderId: string, 
    data: CreateLabResultRequest
  ) => {
    try {
      setLoading(true);
      const newResult = await labService.addResult(orderId, data);
      setState(prev => ({ 
        ...prev, 
        results: [...prev.results, newResult] 
      }));
      showSuccess('Result added successfully');
      return newResult;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to add result');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateResult = useCallback(async (
    id: string, 
    data: UpdateLabResultRequest
  ) => {
    try {
      setLoading(true);
      const updatedResult = await labService.updateResult(id, data);
      setState(prev => ({
        ...prev,
        results: prev.results.map(result => 
          result.id === id ? updatedResult : result
        )
      }));
      showSuccess('Result updated successfully');
      return updatedResult;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update result');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyResult = useCallback(async (
    id: string, 
    data: VerifyLabResultRequest
  ) => {
    try {
      setLoading(true);
      const verifiedResult = await labService.verifyResult(id, data);
      setState(prev => ({
        ...prev,
        results: prev.results.map(result => 
          result.id === id ? verifiedResult : result
        )
      }));
      showSuccess('Result verified successfully');
      return verifiedResult;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to verify result');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Report Generation
  const generatePatientReport = useCallback(async (patientId: string) => {
    try {
      setLoading(true);
      const blob = await labService.generatePatientReport(patientId);
      const filename = `patient-lab-report-${patientId}-${new Date().toISOString().split('T')[0]}.pdf`;
      labService.downloadReport(blob, filename);
      showSuccess('Patient report generated successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to generate patient report');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateOrderReport = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      const blob = await labService.generateOrderReport(orderId);
      const filename = `order-report-${orderId}-${new Date().toISOString().split('T')[0]}.pdf`;
      labService.downloadReport(blob, filename);
      showSuccess('Order report generated successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to generate order report');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateDepartmentReport = useCallback(async (filters: DepartmentReportFilters = {}) => {
    try {
      setLoading(true);
      const blob = await labService.generateDepartmentReport(filters);
      const filename = `department-report-${filters.departmentId || 'all'}-${new Date().toISOString().split('T')[0]}.pdf`;
      labService.downloadReport(blob, filename);
      showSuccess('Department report generated successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to generate department report');
    } finally {
      setLoading(false);
    }
  }, []);

  // Selection management
  const setSelectedOrder = useCallback((order: LabOrder | null) => {
    setState(prev => ({ ...prev, selectedOrder: order }));
  }, []);

  const setSelectedTest = useCallback((test: LabTest | null) => {
    setState(prev => ({ ...prev, selectedTest: test }));
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchTests();
    fetchDepartments();
    fetchOrders();
    fetchTemplates();
  }, []);

  return {
    // State
    ...state,
    
    // Test Management
    fetchTests,
    fetchTestById,
    createTest,
    updateTest,
    deleteTest,
    
    // Department Management
    fetchDepartments,
    createDepartment,
    
    // Template Management
    fetchTemplates,
    createTemplate,
    
    // Order Management
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    updateOrderReport,
    
    // Result Management
    fetchOrderResults,
    addResult,
    updateResult,
    verifyResult,
    
    // Report Generation
    generatePatientReport,
    generateOrderReport,
    generateDepartmentReport,
    
    // Selection Management
    setSelectedOrder,
    setSelectedTest,
    
    // Utility
    refresh: () => {
      fetchTests();
      fetchOrders();
      fetchDepartments();
      fetchTemplates();
    },
  };
}