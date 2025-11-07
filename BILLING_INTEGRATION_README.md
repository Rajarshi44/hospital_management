# Billing System Frontend-Backend Integration Guide

## Current State Analysis

### Frontend Components (Billing Page)
The billing frontend (`/app/billing/page.tsx`) includes:

1. **Dashboard Tab**
   - Collection statistics
   - Revenue by source (OPD, IPD, Pharmacy, Lab, OT)
   - Recent transactions
   - Outstanding receivables

2. **OPD Billing Tab**
   - OPD bill management
   - Line item billing with categories
   - Print functionality

3. **IPD Billing Tab**
   - IPD running bills
   - Admission-based billing
   - TPA status tracking

4. **Insurance/TPA Tab**
   - Insurance claims management
   - TPA claim processing
   - Advance payments
   - Refunds

### Backend Structure Analysis
Current backend has:
- **OPD Module**: Basic OPD visits and billing service
- **IPD Module**: Admissions, treatments, vitals, discharge
- **No dedicated billing models** in schema
- **Basic payment/invoice models** (generic)

## Required Integration Changes

### 1. Database Schema Additions

#### A. OPD Billing Model
```prisma
model OPDBilling {
  id                String           @id @default(cuid())
  billId            String           @unique
  opdVisitId        String           @unique
  patientId         String
  doctorId          String
  
  // Billing Details
  consultationFee   Float
  additionalCharges Float            @default(0)
  labCharges        Float            @default(0)
  pharmacyCharges   Float            @default(0)
  otherCharges      Float            @default(0)
  
  // Calculations
  subtotal          Float
  discount          Float            @default(0)
  tax               Float            @default(0)
  totalAmount       Float
  
  // Payment Information
  paymentStatus     BillingStatus    @default(PENDING)
  paymentMethod     PaymentMethod?
  paidAmount        Float            @default(0)
  balanceAmount     Float            @default(0)
  
  // Timestamps
  billDate          DateTime         @default(now())
  dueDate           DateTime?
  paidAt            DateTime?
  
  // Additional Info
  notes             String?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  
  // Relations
  opdVisit          OPDVisit         @relation(fields: [opdVisitId], references: [id])
  patient           Patient          @relation(fields: [patientId], references: [id])
  doctor            Doctor           @relation(fields: [doctorId], references: [id])
  lineItems         OPDBillingItem[]
  payments          BillingPayment[]
  
  @@map("opd_billing")
}

model OPDBillingItem {
  id            String     @id @default(cuid())
  opdBillingId  String
  category      String     // CONSULTATION, LAB, PHARMACY, PROCEDURE
  description   String
  quantity      Int        @default(1)
  unitPrice     Float
  discount      Float      @default(0)
  totalPrice    Float
  createdAt     DateTime   @default(now())
  
  // Relations
  opdBilling    OPDBilling @relation(fields: [opdBillingId], references: [id])
  
  @@map("opd_billing_items")
}
```

#### B. IPD Billing Model
```prisma
model IPDBilling {
  id                String           @id @default(cuid())
  billId            String           @unique
  admissionId       String           @unique
  patientId         String
  doctorId          String
  
  // Room & Bed Charges
  bedCharges        Float            @default(0)
  roomCharges       Float            @default(0)
  nursingCharges    Float            @default(0)
  
  // Medical Charges
  consultationFee   Float            @default(0)
  procedureCharges  Float            @default(0)
  otCharges         Float            @default(0)
  
  // Other Charges
  labCharges        Float            @default(0)
  pharmacyCharges   Float            @default(0)
  equipmentCharges  Float            @default(0)
  otherCharges      Float            @default(0)
  
  // Calculations
  subtotal          Float
  discount          Float            @default(0)
  tax               Float            @default(0)
  totalAmount       Float
  
  // Payment & Insurance
  paymentStatus     BillingStatus    @default(PENDING)
  insuranceClaim    InsuranceClaim?
  paidAmount        Float            @default(0)
  balanceAmount     Float            @default(0)
  
  // Timestamps
  billDate          DateTime         @default(now())
  dueDate           DateTime?
  finalizedAt       DateTime?
  
  // Status
  isInterim         Boolean          @default(true)
  isFinalized       Boolean          @default(false)
  
  // Additional Info
  notes             String?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  
  // Relations
  admission         Admission        @relation(fields: [admissionId], references: [id])
  patient           Patient          @relation(fields: [patientId], references: [id])
  doctor            Doctor           @relation(fields: [doctorId], references: [id])
  lineItems         IPDBillingItem[]
  payments          BillingPayment[]
  
  @@map("ipd_billing")
}

model IPDBillingItem {
  id            String     @id @default(cuid())
  ipdBillingId  String
  category      String     // BED, CONSULTATION, PROCEDURE, LAB, PHARMACY, OT, NURSING
  description   String
  date          DateTime
  quantity      Int        @default(1)
  unitPrice     Float
  discount      Float      @default(0)
  totalPrice    Float
  createdAt     DateTime   @default(now())
  
  // Relations
  ipdBilling    IPDBilling @relation(fields: [ipdBillingId], references: [id])
  
  @@map("ipd_billing_items")
}
```

#### C. Insurance & TPA Model
```prisma
model InsuranceClaim {
  id                String        @id @default(cuid())
  claimId           String        @unique
  patientId         String
  billId            String?       // Can be OPD or IPD bill
  billType          String        // OPD or IPD
  
  // Insurance Details
  insuranceProvider String
  policyNumber      String
  tpaName           String?
  
  // Claim Details
  claimedAmount     Float
  approvedAmount    Float?
  rejectedAmount    Float?
  deductible        Float         @default(0)
  
  // Status & Dates
  status            ClaimStatus   @default(SUBMITTED)
  submittedAt       DateTime      @default(now())
  processedAt       DateTime?
  settledAt         DateTime?
  
  // Additional Info
  rejectionReason   String?
  notes             String?
  documents         String?       // JSON array of document URLs
  
  // Relations
  patient           Patient       @relation(fields: [patientId], references: [id])
  
  @@map("insurance_claims")
}

model AdvancePayment {
  id            String        @id @default(cuid())
  receiptId     String        @unique
  patientId     String
  amount        Float
  paymentMethod PaymentMethod
  status        AdvanceStatus @default(RECEIVED)
  appliedAmount Float         @default(0)
  balanceAmount Float
  receivedAt    DateTime      @default(now())
  appliedAt     DateTime?
  notes         String?
  
  // Relations
  patient       Patient       @relation(fields: [patientId], references: [id])
  applications  AdvanceApplication[]
  
  @@map("advance_payments")
}

model AdvanceApplication {
  id                String         @id @default(cuid())
  advancePaymentId  String
  billId            String
  billType          String         // OPD or IPD
  appliedAmount     Float
  appliedAt         DateTime       @default(now())
  
  // Relations
  advancePayment    AdvancePayment @relation(fields: [advancePaymentId], references: [id])
  
  @@map("advance_applications")
}

model BillingPayment {
  id            String        @id @default(cuid())
  paymentId     String        @unique
  billId        String
  billType      String        // OPD or IPD
  amount        Float
  paymentMethod PaymentMethod
  status        PaymentStatus @default(COMPLETED)
  transactionId String?
  receivedAt    DateTime      @default(now())
  notes         String?
  
  @@map("billing_payments")
}

// New Enums
enum BillingStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
}

enum ClaimStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  SETTLED
}

enum AdvanceStatus {
  RECEIVED
  APPLIED
  REFUNDED
}
```

### 2. Backend API Routes

#### A. OPD Billing Controller
```typescript
// /src/billing/opd-billing.controller.ts
@Controller('billing/opd')
export class OPDBillingController {
  @Post('/')
  createOPDBill(@Body() createDto: CreateOPDBillingDto) {}
  
  @Get('/')
  getOPDBills(@Query() filters: OPDBillFiltersDto) {}
  
  @Get('/:id')
  getOPDBill(@Param('id') id: string) {}
  
  @Patch('/:id')
  updateOPDBill(@Param('id') id: string, @Body() updateDto: UpdateOPDBillingDto) {}
  
  @Post('/:id/payments')
  recordPayment(@Param('id') id: string, @Body() paymentDto: RecordPaymentDto) {}
  
  @Get('/:id/print')
  printBill(@Param('id') id: string) {}
  
  @Get('/statistics/dashboard')
  getOPDBillingStats() {}
}
```

#### B. IPD Billing Controller
```typescript
// /src/billing/ipd-billing.controller.ts
@Controller('billing/ipd')
export class IPDBillingController {
  @Post('/admission/:admissionId')
  createIPDBill(@Param('admissionId') admissionId: string) {}
  
  @Get('/')
  getIPDBills(@Query() filters: IPDBillFiltersDto) {}
  
  @Get('/:id')
  getIPDBill(@Param('id') id: string) {}
  
  @Patch('/:id/line-items')
  updateLineItems(@Param('id') id: string, @Body() lineItems: IPDBillingItemDto[]) {}
  
  @Post('/:id/finalize')
  finalizeBill(@Param('id') id: string) {}
  
  @Get('/:id/running-total')
  getRunningTotal(@Param('id') id: string) {}
  
  @Post('/:id/payments')
  recordPayment(@Param('id') id: string, @Body() paymentDto: RecordPaymentDto) {}
}
```

#### C. Insurance Claims Controller
```typescript
// /src/billing/insurance.controller.ts
@Controller('billing/insurance')
export class InsuranceController {
  @Post('/claims')
  createClaim(@Body() createDto: CreateClaimDto) {}
  
  @Get('/claims')
  getClaims(@Query() filters: ClaimFiltersDto) {}
  
  @Patch('/claims/:id/status')
  updateClaimStatus(@Param('id') id: string, @Body() statusDto: UpdateClaimStatusDto) {}
  
  @Post('/advances')
  recordAdvance(@Body() advanceDto: RecordAdvanceDto) {}
  
  @Get('/advances')
  getAdvances(@Query() filters: AdvanceFiltersDto) {}
  
  @Post('/advances/:id/apply')
  applyAdvance(@Param('id') id: string, @Body() applicationDto: ApplyAdvanceDto) {}
}
```

#### D. Billing Dashboard Controller
```typescript
// /src/billing/dashboard.controller.ts
@Controller('billing/dashboard')
export class BillingDashboardController {
  @Get('/stats')
  getDashboardStats() {}
  
  @Get('/revenue-by-source')
  getRevenueBySource(@Query() filters: DateRangeDto) {}
  
  @Get('/outstanding-receivables')
  getOutstandingReceivables() {}
  
  @Get('/recent-transactions')
  getRecentTransactions(@Query() filters: TransactionFiltersDto) {}
  
  @Get('/collections')
  getCollections(@Query() filters: DateRangeDto) {}
}
```

### 3. Frontend Service Layer

#### A. Billing Service
```typescript
// /lib/billing-service.ts
export class BillingService {
  // OPD Billing
  static async createOPDBill(visitId: string, billingData: any) {}
  static async getOPDBills(filters?: any) {}
  static async getOPDBill(billId: string) {}
  static async updateOPDBill(billId: string, data: any) {}
  static async recordOPDPayment(billId: string, payment: any) {}
  
  // IPD Billing
  static async createIPDBill(admissionId: string) {}
  static async getIPDBills(filters?: any) {}
  static async getIPDBill(billId: string) {}
  static async updateIPDBillItems(billId: string, items: any[]) {}
  static async finalizeIPDBill(billId: string) {}
  static async recordIPDPayment(billId: string, payment: any) {}
  
  // Insurance & Claims
  static async createClaim(claimData: any) {}
  static async getClaims(filters?: any) {}
  static async updateClaimStatus(claimId: string, status: string) {}
  static async recordAdvance(advanceData: any) {}
  static async getAdvances(filters?: any) {}
  static async applyAdvance(advanceId: string, billId: string, amount: number) {}
  
  // Dashboard
  static async getDashboardStats() {}
  static async getRevenueBySource(dateRange?: any) {}
  static async getOutstandingReceivables() {}
  static async getRecentTransactions() {}
}
```

#### B. Custom Hooks
```typescript
// /hooks/useBilling.ts
export function useBilling() {
  // OPD billing hooks
  const { data: opdBills, isLoading: opdLoading } = useOPDBills()
  const { mutate: createOPDBill } = useCreateOPDBill()
  
  // IPD billing hooks
  const { data: ipdBills, isLoading: ipdLoading } = useIPDBills()
  const { mutate: updateIPDBill } = useUpdateIPDBill()
  
  // Dashboard hooks
  const { data: dashboardStats } = useBillingDashboard()
  const { data: revenueData } = useRevenueBySource()
  
  return {
    // OPD
    opdBills,
    opdLoading,
    createOPDBill,
    
    // IPD
    ipdBills,
    ipdLoading,
    updateIPDBill,
    
    // Dashboard
    dashboardStats,
    revenueData,
  }
}
```

### 4. Implementation Steps

#### Phase 1: Database Setup
1. Add billing models to `schema.prisma`
2. Create and run migrations
3. Update existing models with billing relations

#### Phase 2: Backend API Development
1. Create billing module structure:
   ```
   src/billing/
   ├── billing.module.ts
   ├── opd-billing/
   ├── ipd-billing/
   ├── insurance/
   ├── dashboard/
   └── dto/
   ```
2. Implement controllers and services
3. Add validation and error handling
4. Create billing DTOs

#### Phase 3: Frontend Integration
1. Replace mock data with API calls
2. Create billing service layer
3. Implement custom hooks
4. Update UI components to handle real data
5. Add loading states and error handling

#### Phase 4: Testing & Optimization
1. Unit tests for services
2. Integration tests for API endpoints
3. Frontend component testing
4. Performance optimization

### 5. Key Integration Points

#### A. OPD Visit → OPD Billing
- Auto-create billing when OPD visit is completed
- Populate consultation fee from doctor's rate
- Allow adding additional charges

#### B. IPD Admission → IPD Billing
- Auto-create interim bill on admission
- Daily bed charges calculation
- Real-time running total updates

#### C. Insurance Claims Integration
- Link claims to bills (OPD/IPD)
- Auto-calculate claim amounts
- Status tracking workflow

#### D. Dashboard Data Sources
- Real-time collection calculations
- Revenue breakdown by source
- Outstanding receivables tracking

### 6. Configuration Requirements

#### Environment Variables
```env
# Billing Configuration
BILLING_TAX_RATE=18
BILLING_SERVICE_CHARGE_RATE=15
BILLING_AUTO_FINALIZE_DAYS=7

# Insurance Configuration
INSURANCE_CLAIM_TIMEOUT_DAYS=30
TPA_INTEGRATION_ENABLED=true

# Payment Gateway (if applicable)
PAYMENT_GATEWAY_KEY=xxx
PAYMENT_GATEWAY_SECRET=xxx
```

### 7. Migration Strategy

#### Existing Data Migration
1. **OPD Visits**: Create billing records for existing completed visits
2. **IPD Admissions**: Create interim bills for active admissions
3. **Payments**: Migrate existing payment records to new structure

#### Backward Compatibility
- Maintain existing invoice/payment models during transition
- Gradual migration to new billing system
- Fallback mechanisms for legacy data

This comprehensive integration plan provides a structured approach to connecting the billing frontend with a robust backend system, ensuring all billing scenarios (OPD, IPD, Insurance) are properly handled.