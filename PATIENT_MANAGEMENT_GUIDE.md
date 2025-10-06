# Patient Management System Integration Guide

## Overview

The Patient Management system has been integrated with the backend API to provide full CRUD operations for patient records.

## Features

✅ **View All Patients** - Browse and search through all patient records
✅ **Search Patients** - Real-time search by name, email, phone, or ID
✅ **Add New Patients** - Create new patient records with comprehensive information
✅ **Edit Patients** - Update existing patient information
✅ **View Patient Details** - View complete patient information in organized tabs
✅ **Activate/Deactivate Patients** - Toggle patient account status
✅ **Delete Patients** - Remove patient records (admin only on backend)

## Files Created/Modified

### New Files

1. **`lib/patient-service.ts`**
   - Service class for all patient API operations
   - Helper methods for data transformation
   - Search and filter functionality

2. **`components/patients/patient-form.tsx`**
   - Comprehensive form for creating/editing patients
   - Form validation
   - Support for all patient fields

3. **`components/patients/patient-details.tsx`**
   - Detailed patient view with tabs
   - Display personal, medical, contact, and emergency information
   - Patient activation/deactivation toggle

### Modified Files

1. **`components/patients/patient-search.tsx`**
   - Updated to fetch patients from API
   - Real-time search functionality
   - Loading states

2. **`app/patients/page.tsx`**
   - Complete rewrite to support multiple views
   - View mode management (search/form/details/edit)
   - Refresh triggering after updates

## API Integration

### Patient Service Methods

```typescript
const patientService = PatientService.getInstance()

// Get all patients (requires authentication)
const patients = await patientService.getAllPatients()

// Get patient by ID
const patient = await patientService.getPatientById('patient-id')

// Create new patient (no auth required for registration)
const newPatient = await patientService.createPatient({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'MALE',
  phone: '555-123-4567',
  email: 'john.doe@email.com',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '555-123-4568',
  emergencyContactRelationship: 'Spouse',
  // Optional fields
  bloodGroup: 'A+',
  allergies: 'Penicillin, Shellfish',
  chronicConditions: 'Hypertension',
  currentMedications: 'Lisinopril 10mg',
})

// Update patient (requires authentication)
const updated = await patientService.updatePatient('patient-id', {
  phone: '555-987-6543',
  address: '456 Oak Ave',
})

// Deactivate patient (requires admin role)
await patientService.deactivatePatient('patient-id')

// Activate patient (requires admin role)
await patientService.activatePatient('patient-id')

// Delete patient (requires admin role)
await patientService.deletePatient('patient-id')
```

### Helper Methods

```typescript
// Search/filter patients locally
const results = patientService.searchPatients(allPatients, 'john')

// Get full name
const name = patientService.getFullName(patient) // "John Doe"

// Calculate age
const age = patientService.calculateAge(patient.dateOfBirth) // 33

// Parse allergies
const allergies = patientService.getAllergiesArray(patient) // ['Penicillin', 'Shellfish']

// Parse medications
const meds = patientService.getMedicationsArray(patient) // ['Lisinopril 10mg']
```

## Data Model

### Patient Type

```typescript
interface Patient {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth: string | Date
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  bloodGroup?: string | null
  allergies?: string | null
  chronicConditions?: string | null
  currentMedications?: string | null
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}
```

### Create/Update DTOs

```typescript
interface CreatePatientDto {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  bloodGroup?: string
  allergies?: string
  chronicConditions?: string
  currentMedications?: string
}

interface UpdatePatientDto {
  // All fields are optional
  firstName?: string
  lastName?: string
  // ... (all fields from CreatePatientDto)
}
```

## User Flows

### 1. View Patients
1. Navigate to `/patients`
2. System loads all patients from API
3. Search box allows filtering by name, email, phone, or ID
4. Click on a patient card to view details

### 2. Add New Patient
1. Click "New Patient" button
2. Fill in the comprehensive form
3. Required fields are marked with *
4. Submit to create patient
5. Automatically redirects to patient details view

### 3. Edit Patient
1. View patient details
2. Click "Edit" button
3. Form loads with existing data
4. Modify fields as needed
5. Submit to update
6. Returns to patient details view

### 4. Activate/Deactivate Patient
1. View patient details
2. Click "Activate" or "Deactivate" button
3. Status updates immediately
4. Badge updates to reflect new status

## Backend Permissions

The backend uses role-based access control:

| Action | Allowed Roles |
|--------|---------------|
| Create Patient | Anyone (for registration) |
| View All Patients | ADMIN, DOCTOR, NURSE |
| View Patient | ADMIN, DOCTOR, NURSE, PATIENT (own record) |
| Update Patient | ADMIN, DOCTOR, NURSE, PATIENT (own record) |
| Delete Patient | ADMIN only |
| Activate/Deactivate | ADMIN only |

## Form Validation

### Required Fields
- First Name
- Last Name
- Date of Birth
- Gender
- Phone
- Email
- Address
- City
- State
- ZIP Code
- Emergency Contact Name
- Emergency Contact Phone
- Emergency Contact Relationship

### Optional Fields
- Blood Group
- Allergies (comma-separated)
- Chronic Conditions (free text)
- Current Medications (comma-separated)

## UI Components

### PatientSearch
- Real-time search functionality
- Loading states
- Empty states
- Patient cards with key information
- "New Patient" button

### PatientForm
- Sectioned form layout:
  - Personal Information
  - Contact Information
  - Emergency Contact
  - Medical Information
- Form validation
- Loading states during submission
- Error handling with toast notifications

### PatientDetails
- Tabbed interface:
  - **Overview**: Personal info and allergies
  - **Medical Info**: Medications and chronic conditions
  - **Contact**: Phone, email, and address
  - **Emergency**: Emergency contact details
- Patient header with avatar, name, and status badge
- Action buttons: Edit, Activate/Deactivate, Close
- Real-time status updates

## Error Handling

All API calls include try-catch blocks with user-friendly error messages:

```typescript
try {
  await patientService.createPatient(data)
  toast({
    title: "Success",
    description: "Patient created successfully",
  })
} catch (error) {
  toast({
    title: "Error",
    description: error instanceof Error ? error.message : "An error occurred",
    variant: "destructive",
  })
}
```

## Testing Checklist

### Without Backend Running
- [ ] Pages load without crashing
- [ ] Appropriate error messages shown
- [ ] No infinite loading states

### With Backend Running
- [ ] Patient list loads correctly
- [ ] Search functionality works
- [ ] Can create new patients
- [ ] Can view patient details
- [ ] Can edit existing patients
- [ ] Can toggle patient status (admin)
- [ ] Proper error handling for invalid data
- [ ] Toast notifications work
- [ ] Navigation between views works

## Troubleshooting

### "Failed to fetch patients"
- Check backend is running
- Verify authentication token is valid
- Check user has appropriate role (ADMIN, DOCTOR, or NURSE)
- Check CORS settings on backend

### "Failed to create patient"
- Verify all required fields are filled
- Check email format is valid
- Ensure email is not already in use
- Check phone number format

### "Failed to update patient"
- Verify user is authenticated
- Check user has permission to update
- Ensure patient ID is valid

### Patients not loading
- Open browser console for errors
- Check network tab for failed requests
- Verify API_URL in environment variables
- Test backend endpoints directly with Postman

## Future Enhancements

- [ ] Add patient photo upload
- [ ] Implement medical history tracking
- [ ] Add vital signs recording
- [ ] Implement appointment history
- [ ] Add prescription management
- [ ] Export patient records to PDF
- [ ] Bulk patient import from CSV
- [ ] Advanced filtering (by age, blood type, etc.)
- [ ] Patient analytics dashboard
- [ ] Automated appointment reminders

## Best Practices

1. **Always validate user input** before sending to backend
2. **Handle errors gracefully** with user-friendly messages
3. **Show loading states** during async operations
4. **Refresh data** after successful updates
5. **Use proper TypeScript types** for type safety
6. **Follow HIPAA guidelines** for patient data handling
7. **Implement proper access control** based on user roles
8. **Log errors** for debugging purposes

## Support

For issues or questions:
1. Check backend API logs
2. Verify authentication is working
3. Test backend endpoints independently
4. Check browser console for errors
5. Review network requests in DevTools
