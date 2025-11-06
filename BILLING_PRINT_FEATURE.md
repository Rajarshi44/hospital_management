# Billing Print Feature - Implementation Guide

## Overview
I've implemented a complete billing print system that overlays bill information on the Srijoni Healing Home letterhead format.

## Features Implemented

### 1. **Bill Print Layout Component** (`components/billing/bill-print-layout.tsx`)
- Full A4 page letterhead format
- Company header with logo placeholder
- Patient information section
- Visit details (admission, discharge, doctor, diagnosis)
- Itemized billing table with categories
- Automatic calculations for service charges and totals
- Amount in words conversion
- Signature sections
- Watermark with company logo
- Print-optimized styling

### 2. **Dynamic Billing Form**
Updated the OPD billing dialog with:
- Patient info fields connected to state
- Visit details connected to state
- Dynamic billing categories
- Print button functionality

### 3. **Print Functionality**
- Print button in the dialog footer
- Automatic print dialog trigger
- Print-only CSS that hides everything except the bill
- A4 page size optimization

## How to Use

### For Users:
1. Click "New OPD Bill" button
2. Fill in patient information (Name, UHID, Age, Gender, etc.)
3. Fill in visit details (Admission date, Doctor, Diagnosis)
4. Add billing categories and line items as needed
5. Enter rates and discounts (amounts calculate automatically)
6. Click **"Print Bill"** button
7. Browser print dialog will open with the formatted bill
8. Print or save as PDF

### Bill Format Features:
- **Header**: Srijoni Healing Home letterhead
- **Bill Number**: Auto-generated (format: 2223/SHH/01XXX)
- **Patient Info**: Name, Address, Age, Gender, UHID, PAN, CIN
- **Visit Info**: Admission/Discharge dates, Doctor, Diagnosis
- **Billing Table**: 
  - Categorized items (BED CHARGES, OT RENT, GENERAL CHARGES, etc.)
  - Description, Type, Rate, Discount, Amount columns
  - Service charge (15%) calculation
  - Gross amount
- **Totals Section**: 
  - Total amount
  - Bill amount
  - Paid amount
- **Amount in Words**: Converts number to Indian currency format (Crores, Lakhs, etc.)
- **Signatures**: Patient/Guardian and Authorized Signatory
- **Watermark**: Company logo watermark in center

## Technical Details

### State Management:
```typescript
- patientInfo: { name, uhid, age, gender, pan, cin, address }
- visitInfo: { admissionDate, dischargeDate, doctor, diagnosis }
- billingCategories: Array of categories with line items
- showPrintPreview: Controls when print layout is rendered
```

### Print Styling:
- Uses `@media print` CSS rules
- A4 page size (210mm width)
- Print margins: 10mm
- Hides all page content except the print component
- Optimized for professional printing

### Calculation Logic:
- Amount = Rate - Discount (per item)
- Subtotal = Sum of all amounts
- Service Charge = 15% of subtotal
- Bill Amount = Subtotal + Service Charge

## Files Modified/Created

1. **Created**: `components/billing/bill-print-layout.tsx` - Print layout component
2. **Modified**: `app/billing/page.tsx` - Added print functionality and state management
3. **Created**: This documentation file

## Browser Compatibility
- Works with all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses native browser print functionality
- Supports "Save as PDF" option

## Future Enhancements
- Add company logo image upload
- Support for multiple payment modes
- Print preview before printing
- Email bill functionality
- Save bill as PDF server-side
- Barcode/QR code for bill number

## Testing
To test the print feature:
1. Fill out a complete bill with all details
2. Click "Print Bill"
3. Check print preview to ensure formatting is correct
4. Test with actual printer or "Save as PDF"

## Notes
- Bill numbers are auto-generated based on timestamp
- Service charge is fixed at 15% (can be made configurable)
- Amount in words supports Indian numbering (Crore, Lakh, Thousand)
- Letterhead design matches the attached Srijoni Healing Home format
