import { IPDService, CreateAdmissionDto } from './ipd-service';

// Map frontend admission types to backend enum values
function mapAdmissionType(frontendType: string): 'EMERGENCY' | 'ELECTIVE' | 'REFERRAL' {
  const mapping: { [key: string]: 'EMERGENCY' | 'ELECTIVE' | 'REFERRAL' } = {
    'Emergency': 'EMERGENCY',
    'Scheduled': 'ELECTIVE', // Map Scheduled to Elective
    'Transfer': 'REFERRAL', // Map Transfer to Referral
  };
  
  return mapping[frontendType] || 'ELECTIVE';
}

// Transform enhanced form data to backend DTO format
export function transformEnhancedFormToDTO(formData: any): CreateAdmissionDto {
  return {
    // Patient data for new patient creation
    patientData: {
      firstName: formData.fullName.split(' ')[0] || formData.fullName,
      lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
      email: formData.email || undefined,
      phone: formData.phone,
      dateOfBirth: formData.dob,
      gender: formData.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER',
      address: formData.address,
      bloodGroup: formData.bloodGroup || undefined,
      allergies: formData.allergies || undefined,
      chronicConditions: formData.medicalHistory || undefined,
      currentMedications: formData.ongoingMedication || undefined,
      emergencyContactName: formData.guardianName,
      emergencyContactPhone: formData.guardianPhone,
      emergencyContactRelationship: formData.relation,
    },
    
    // Admission details
    doctorId: formData.admittingDoctor,
    bedId: formData.bedNo, // This should be the bed ID, not bed number
    admissionType: mapAdmissionType(formData.admissionType),
    chiefComplaint: formData.reasonForAdmission,
    provisionalDiagnosis: formData.reasonForAdmission, // Can be same initially
    
    // Financial details
    estimatedCost: 0, // Can be calculated later
    depositAmount: formData.advanceAmount || 0,
    
    // Insurance details if payment mode is insurance
    insuranceDetails: formData.paymentMode === 'Insurance' 
      ? `Provider: ${formData.insuranceProvider}, Policy: ${formData.policyNumber}${formData.tpaDetails ? ', TPA: ' + formData.tpaDetails : ''}`
      : undefined,
      
    // Additional notes
    notes: formData.ongoingMedication ? `Current Medications: ${formData.ongoingMedication}` : undefined,
  };
}

// API functions for enhanced admission form
export async function getDepartments() {
  try {
    return await IPDService.getDepartments();
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
}

export async function getDoctorsByDepartment(departmentId: string) {
  try {
    return await IPDService.getDoctorsByDepartment(departmentId);
  } catch (error) {
    console.error('Error fetching doctors by department:', error);
    throw error;
  }
}

export async function getWardsByType(wardType: string) {
  try {
    // Map frontend ward types to backend ward types
    const wardTypeMapping: { [key: string]: string } = {
      'General': 'GENERAL',
      'Semi-Private': 'GENERAL', 
      'Private': 'GENERAL',
      'ICU': 'ICU',
      'PICU': 'ICU',
      'NICU': 'NICU',
    };
    
    const filters = {
      type: wardTypeMapping[wardType] || wardType.toUpperCase(),
      isActive: true,
      hasAvailableBeds: true,
    };
    return await IPDService.getWards(filters);
  } catch (error) {
    console.error('Error fetching wards:', error);
    throw error;
  }
}

export async function getAvailableRoomsByWard(wardId: string) {
  try {
    const beds = await IPDService.getBedsByWard(wardId, { isOccupied: false }) as any[];
    
    if (!beds || beds.length === 0) {
      return ['101', '102', '103']; // Default rooms if no beds found
    }
    
    // Extract unique room numbers from beds, generate if not present
    const rooms = [...new Set(beds.map((bed: any, index: number) => {
      // If bed has room number, use it; otherwise generate based on bed number
      if (bed.roomNumber) {
        return bed.roomNumber;
      }
      // Generate room numbers like 101, 102, etc. based on bed number
      const bedNum = parseInt(bed.bedNumber?.split('-')?.pop() || (index + 1).toString());
      return `${Math.floor((bedNum - 1) / 4) + 101}`; // 4 beds per room, starting from 101
    }))];
    return rooms.filter(Boolean);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    // Return mock rooms as fallback
    return ['101', '102', '103', '104'];
  }
}

export async function getAvailableBedsByRoom(wardId: string, roomNumber?: string) {
  try {
    const beds = await IPDService.getBedsByWard(wardId, { isOccupied: false }) as any[];
    
    if (!beds || beds.length === 0) {
      return []; // Return empty array if no beds found
    }
    
    // Filter by room if specified, otherwise return all available beds
    let filteredBeds = beds;
    
    if (roomNumber) {
      filteredBeds = beds.filter((bed: any) => {
        // If bed has roomNumber, use it; otherwise generate based on bed number
        if (bed.roomNumber) {
          return bed.roomNumber === roomNumber;
        }
        // Generate room number from bed number and check if it matches
        const bedNum = parseInt(bed.bedNumber?.split('-')?.pop() || '1');
        const generatedRoom = `${Math.floor((bedNum - 1) / 4) + 101}`;
        return generatedRoom === roomNumber;
      });
    }
      
    return filteredBeds.map((bed: any) => ({
      id: bed.id,
      bedNumber: bed.bedNumber || `Bed-${bed.id}`,
      bedType: bed.bedType || 'Standard',
      dailyRate: bed.dailyRate || 1500, // Default rate if missing
    }));
  } catch (error) {
    console.error('Error fetching beds:', error);
    throw error;
  }
}

export async function createEnhancedAdmission(admissionDTO: CreateAdmissionDto) {
  try {
    return await IPDService.createAdmission(admissionDTO);
  } catch (error) {
    console.error('Error creating admission:', error);
    throw error;
  }
}

export async function uploadDocuments(files: FileList, patientId?: string, category: string = 'ADMISSION') {
  try {
    // If no patientId provided, use a temporary one (this would be updated after patient creation)
    const tempPatientId = patientId || 'temp-' + Date.now();
    return await IPDService.uploadDocuments(files, tempPatientId, category);
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw error;
  }
}

// Mock data for development/fallback
export const mockDepartments = [
  { id: '1', name: 'Cardiology', description: 'Heart and cardiovascular care' },
  { id: '2', name: 'Neurology', description: 'Brain and nervous system' },
  { id: '3', name: 'Orthopedics', description: 'Bone and joint care' },
  { id: '4', name: 'Emergency', description: 'Emergency medical care' },
];

export const mockDoctors = [
  { id: '1', firstName: 'John', lastName: 'Smith', specialization: 'Cardiology', departmentId: '1' },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', specialization: 'Neurology', departmentId: '2' },
  { id: '3', firstName: 'Michael', lastName: 'Brown', specialization: 'Orthopedics', departmentId: '3' },
  { id: '4', firstName: 'Emily', lastName: 'Davis', specialization: 'Emergency Medicine', departmentId: '4' },
  { id: '5', firstName: 'Robert', lastName: 'Wilson', specialization: 'Internal Medicine', departmentId: '1' },
];

export const mockWards = [
  { id: '1', name: 'General Ward A', type: 'GENERAL', availableBeds: 5 },
  { id: '2', name: 'ICU Ward', type: 'ICU', availableBeds: 2 },
  { id: '3', name: 'Private Ward', type: 'GENERAL', availableBeds: 8 },
];

export const mockBeds = [
  { id: '1', bedNumber: 'B001', roomNumber: '101', wardId: '1', isOccupied: false },
  { id: '2', bedNumber: 'B002', roomNumber: '101', wardId: '1', isOccupied: false },
  { id: '3', bedNumber: 'B003', roomNumber: '102', wardId: '1', isOccupied: false },
];