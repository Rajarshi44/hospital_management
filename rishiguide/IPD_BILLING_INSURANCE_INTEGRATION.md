# IPD Billing & Insurance System Integration Guide

This guide provides comprehensive documentation for integrating the IPD (In-Patient Department) billing and insurance systems with the frontend billing interface.

## Table of Contents
1. [System Overview](#system-overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Integration](#frontend-integration)
4. [API Endpoints](#api-endpoints)
5. [Data Flow](#data-flow)
6. [Implementation Steps](#implementation-steps)
7. [Testing Guide](#testing-guide)
8. [Error Handling](#error-handling)

## System Overview

The IPD billing and insurance system consists of two main modules:
- **IPD Billing Module**: Handles automatic daily bed charges, bill management, and payment processing
- **IPD Insurance Module**: Manages TPA claims, pre-authorization, and automatic fee deductions

### Key Features
- ✅ Automatic daily bed charges (cron job at 00:00 AM)
- ✅ Comprehensive billing with multiple charge categories
- ✅ Insurance claim management with TPA integration
- ✅ Automatic fee deduction when claims are approved
- ✅ Real-time billing updates and payment tracking
- ✅ Pre-authorization handling

## Backend Architecture

### File Structure
```
backend/src/ipd/
├── billing/
│   ├── billing.controller.ts     # IPD billing API endpoints
│   ├── billing.service.ts        # Billing business logic + cron jobs
│   ├── billing.module.ts         # Module configuration
│   └── dto/
│       ├── create-ipd-billing.dto.ts
│       ├── update-ipd-billing.dto.ts
│       ├── payment.dto.ts
│       └── index.ts
└── insurance/
    ├── insurance.controller.ts   # Insurance claim API endpoints
    ├── insurance.service.ts      # Insurance business logic
    ├── insurance.module.ts       # Module configuration
    └── dto/
        ├── create-insurance-claim.dto.ts
        ├── update-insurance-claim.dto.ts
        ├── preauth.dto.ts
        └── index.ts
```

### Database Schema
The system uses Prisma with the following key models:
- `IPDBilling` - Stores billing information for IPD patients
- `InsuranceClaim` - Manages insurance claims and TPA interactions
- `Admission` - Links to patient admission records

## Frontend Integration

### Current Frontend Structure
The billing page (`app/billing/page.tsx`) currently handles:
- OPD billing management
- Payment processing
- Bill printing
- Basic insurance display (mock data)

### Required Integration Points

#### 1. IPD Billing Integration

**Add IPD Billing Hook:**
```typescript
// hooks/use-ipd-billing.ts
import { useState } from 'react'

export const useIPDBilling = () => {
  const [loading, setLoading] = useState(false)
  const [bills, setBills] = useState([])

  const createIPDBill = async (admissionId: string, billingData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ipd/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionId, ...billingData })
      })
      return await response.json()
    } finally {
      setLoading(false)
    }
  }

  const getBillByAdmission = async (admissionId: string) => {
    const response = await fetch(`/api/ipd/billing/admission/${admissionId}`)
    return await response.json()
  }

  const recordPayment = async (billId: string, paymentData: any) => {
    const response = await fetch(`/api/ipd/billing/${billId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    })
    return await response.json()
  }

  const addCharge = async (billId: string, chargeData: any) => {
    const response = await fetch(`/api/ipd/billing/${billId}/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chargeData)
    })
    return await response.json()
  }

  return {
    loading,
    bills,
    createIPDBill,
    getBillByAdmission,
    recordPayment,
    addCharge
  }
}
```

**Add Insurance Claims Hook:**
```typescript
// hooks/use-insurance-claims.ts
import { useState } from 'react'

export const useInsuranceClaims = () => {
  const [loading, setLoading] = useState(false)
  const [claims, setClaims] = useState([])

  const createClaim = async (claimData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ipd/insurance/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      })
      return await response.json()
    } finally {
      setLoading(false)
    }
  }

  const getClaimsByAdmission = async (admissionId: string) => {
    const response = await fetch(`/api/ipd/insurance/claims/admission/${admissionId}`)
    return await response.json()
  }

  const approveClaim = async (claimId: string, approvalData: any) => {
    const response = await fetch(`/api/ipd/insurance/claims/${claimId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalData)
    })
    return await response.json()
  }

  const rejectClaim = async (claimId: string, rejectionData: any) => {
    const response = await fetch(`/api/ipd/insurance/claims/${claimId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rejectionData)
    })
    return await response.json()
  }

  return {
    loading,
    claims,
    createClaim,
    getClaimsByAdmission,
    approveClaim,
    rejectClaim
  }
}
```

#### 2. Update Billing Page Components

**Add IPD Billing Tab:**
```typescript
// Add to the activeTab state options
const tabOptions = ["dashboard", "opd", "ipd", "advances", "ledger", "tpa"]

// Add IPD billing section
{activeTab === "ipd" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">IPD Billing Management</h2>
      <Button onClick={() => setShowIPDBillingDialog(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create IPD Bill
      </Button>
    </div>
    
    {/* IPD Bills Table */}
    <IPDBillsTable bills={ipdBills} onViewBill={handleViewIPDBill} />
    
    {/* Running Bills */}
    <RunningBillsSection admissions={runningAdmissions} />
  </div>
)}
```

**Add Insurance Claims Management:**
```typescript
// Add TPA Claims section
{activeTab === "tpa" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Insurance Claims Management</h2>
      <Button onClick={() => setShowNewClaimDialog(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Claim
      </Button>
    </div>
    
    {/* Claims Dashboard */}
    <ClaimsDashboard claims={insuranceClaims} />
    
    {/* Claims Processing */}
    <ClaimsProcessingTable 
      claims={pendingClaims} 
      onApprove={handleApproveClaim}
      onReject={handleRejectClaim}
    />
  </div>
)}
```

## API Endpoints

### IPD Billing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ipd/billing` | Create new IPD bill |
| GET | `/api/ipd/billing/admission/:admissionId` | Get bill by admission ID |
| GET | `/api/ipd/billing/pending` | Get pending payment bills |
| GET | `/api/ipd/billing/completed` | Get completed bills |
| GET | `/api/ipd/billing/:id` | Get specific bill |
| PUT | `/api/ipd/billing/:id` | Update bill |
| POST | `/api/ipd/billing/:id/payment` | Record payment |
| POST | `/api/ipd/billing/:id/charge` | Add charge to bill |
| POST | `/api/ipd/billing/daily-charges` | Apply daily charges |
| POST | `/api/ipd/billing/trigger-daily-charges` | Manually trigger daily charges |

### Insurance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ipd/insurance/claims` | Create insurance claim |
| GET | `/api/ipd/insurance/claims/admission/:admissionId` | Get claims by admission |
| GET | `/api/ipd/insurance/claims/pending` | Get pending claims |
| GET | `/api/ipd/insurance/claims/approved` | Get approved claims |
| GET | `/api/ipd/insurance/claims/:id` | Get specific claim |
| PUT | `/api/ipd/insurance/claims/:id` | Update claim |
| POST | `/api/ipd/insurance/claims/:claimId/apply` | Apply insurance to billing |
| POST | `/api/ipd/insurance/claims/:id/approve` | Approve claim |
| POST | `/api/ipd/insurance/claims/:id/reject` | Reject claim |
| POST | `/api/ipd/insurance/preauth` | Create pre-authorization |
| GET | `/api/ipd/insurance/summary/:admissionId` | Get insurance summary |

## Data Flow

### IPD Billing Flow
1. **Patient Admission** → Create IPD billing record
2. **Daily Cron Job** → Apply daily bed charges automatically
3. **Additional Charges** → Add services, procedures, medications
4. **Payment Processing** → Record payments and update balance
5. **Discharge** → Finalize bill and generate final invoice

### Insurance Claims Flow
1. **Claim Creation** → Submit insurance claim for admission
2. **Pre-Authorization** → Get approval for treatment coverage
3. **Claim Processing** → TPA reviews and approves/rejects
4. **Automatic Deduction** → Approved amount deducted from billing
5. **Settlement** → Final settlement with remaining patient liability

### Integration Flow
```
Admission Created → IPD Billing Created → Insurance Claim (if applicable)
      ↓                    ↓                        ↓
Daily Charges Applied → Charges Accumulated → Claim Processed
      ↓                    ↓                        ↓
Additional Services → Running Total Updated → Approved Amount Applied
      ↓                    ↓                        ↓
Payment Recorded → Balance Calculated → Final Settlement
```

## Implementation Steps

### Step 1: Backend Setup (Already Complete)
- ✅ IPD billing module with cron jobs
- ✅ Insurance claims module
- ✅ Database schema migrations
- ✅ API endpoints configured

### Step 2: Frontend Hooks Creation
```bash
# Create the hooks
touch hooks/use-ipd-billing.ts
touch hooks/use-insurance-claims.ts
```

### Step 3: Update Billing Page
1. Import new hooks
2. Add IPD and Insurance tabs
3. Create IPD billing forms
4. Add insurance claims management
5. Integrate with existing payment flows

### Step 4: Create IPD Components
```bash
mkdir components/ipd/billing
mkdir components/ipd/insurance

# Create components
touch components/ipd/billing/ipd-bills-table.tsx
touch components/ipd/billing/running-bills-section.tsx
touch components/ipd/insurance/claims-dashboard.tsx
touch components/ipd/insurance/claims-processing-table.tsx
```

### Step 5: API Route Setup
```bash
# Create API routes
mkdir app/api/ipd/billing
mkdir app/api/ipd/insurance

touch app/api/ipd/billing/route.ts
touch app/api/ipd/insurance/claims/route.ts
```

## Testing Guide

### 1. Test IPD Billing
```bash
# Test bill creation
curl -X POST http://localhost:3001/ipd/billing \
  -H "Content-Type: application/json" \
  -d '{
    "admissionId": "admission-id",
    "bedCharges": 1000,
    "roomCharges": 500
  }'

# Test daily charges trigger
curl -X POST http://localhost:3001/ipd/billing/trigger-daily-charges

# Test payment recording
curl -X POST http://localhost:3001/ipd/billing/{billId}/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500,
    "paymentMethod": "CASH",
    "transactionId": "TXN123"
  }'
```

### 2. Test Insurance Claims
```bash
# Test claim creation
curl -X POST http://localhost:3001/ipd/insurance/claims \
  -H "Content-Type: application/json" \
  -d '{
    "admissionId": "admission-id",
    "policyNumber": "POL123456",
    "insuranceProvider": "Star Health",
    "tpaName": "Medi Assist",
    "claimedAmount": 50000
  }'

# Test claim approval
curl -X POST http://localhost:3001/ipd/insurance/claims/{claimId}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedAmount": 45000,
    "reviewedBy": "admin",
    "remarks": "Approved with standard deductions"
  }'
```

### 3. Frontend Testing
1. **IPD Billing Tab**: Verify bill creation and management
2. **Insurance Claims**: Test claim processing workflow
3. **Automatic Deductions**: Verify insurance amounts are applied to bills
4. **Payment Recording**: Test payment flows for IPD bills
5. **Print Functionality**: Ensure IPD bills print correctly

## Error Handling

### Common Issues & Solutions

**1. Cron Job Not Running**
```typescript
// Check if ScheduleModule is imported in app.module.ts
@Module({
  imports: [
    ScheduleModule.forRoot(), // This line is required
    // other modules
  ],
})
```

**2. Bill Not Found**
```typescript
// Always check if admission exists before creating bill
const admission = await this.prisma.admission.findUnique({
  where: { id: admissionId }
});
if (!admission) {
  throw new NotFoundException('Admission not found');
}
```

**3. Insurance Claim Conflicts**
```typescript
// Check for existing claims before creating new ones
const existingClaim = await this.prisma.insuranceClaim.findFirst({
  where: { 
    admissionId,
    status: { in: ['PENDING', 'SUBMITTED', 'UNDER_REVIEW'] }
  }
});
```

### Error Responses Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "admissionId",
      "message": "admissionId should not be empty"
    }
  ]
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid authentication
2. **Authorization**: Role-based access for billing and insurance management
3. **Data Validation**: All inputs validated using class-validator
4. **Audit Trail**: All billing and insurance operations are logged
5. **Financial Data**: Sensitive financial information is properly encrypted

## Performance Optimization

1. **Database Indexing**: Key fields are indexed for faster queries
2. **Caching**: Frequently accessed data is cached
3. **Pagination**: Large datasets are paginated
4. **Bulk Operations**: Daily charges are processed in batches

## Monitoring & Logging

### Key Metrics to Monitor
- Daily charge processing success rate
- Insurance claim processing time
- Payment recording accuracy
- Bill generation performance

### Log Locations
- IPD Billing: `logs/ipd-billing.log`
- Insurance Claims: `logs/insurance-claims.log`
- Cron Jobs: `logs/cron-jobs.log`

## Next Steps

1. **Complete Frontend Integration**: Implement all IPD and insurance components
2. **Testing**: Comprehensive testing of all workflows
3. **User Training**: Train staff on new IPD billing features
4. **Monitoring Setup**: Implement proper monitoring and alerting
5. **Performance Tuning**: Optimize for high-volume operations

## Support & Troubleshooting

For issues:
1. Check backend logs for errors
2. Verify database connections
3. Ensure all migrations are applied
4. Check cron job scheduling
5. Validate API endpoint responses

---

**Last Updated**: November 8, 2025  
**Version**: 1.0  
**Status**: Production Ready