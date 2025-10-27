# OPD Patient Visit Form - Quick Start Guide

## Accessing the OPD Form

### For Administrators
1. Login to the Hospital Management System
2. Navigate to **Patient Management** in the sidebar
3. Click on **OPD Visit**

### For Doctors
1. Login to the Hospital Management System
2. Navigate to **Patients** in the sidebar
3. Click on **OPD Visit**

### For Receptionists
1. Login to the Hospital Management System
2. Navigate to **Patients** in the sidebar
3. Click on **OPD Visit**

## Form Workflow

### Step 1: Patient Registration
- **Search Existing Patient:** Type UHID, name, or phone in the search box
  - Select patient from dropdown results
  - Registration fields auto-fill
- **New Patient:** Click "Add New Patient" button
  - Fill in all required fields (marked with *)
  - At minimum: First Name, Age, Gender, Phone

### Step 2: Visit & Doctor Assignment
- Select **Department** (e.g., General Medicine, Cardiology)
- Select **Consulting Doctor** from filtered list
- Choose **Appointment Time Slot** (if available)
  - Green = Available
  - Yellow = Booked (overbooking warning)
  - Red = Blocked (cannot select)
- Select **Visit Type** (OPD, Emergency, Review)
- Choose **Appointment Mode** (Walk-in, Online, Phone)

### Step 3: Record Vitals
- Enter **Height** (cm) and **Weight** (kg)
  - BMI auto-calculates and displays category
- Enter **Temperature** (°C) - Required
- Enter **Blood Pressure** (format: 120/80) - Required
- Enter **Pulse Rate** (bpm) - Required
- Enter **SpO2** (%) - Required
- Optional: Respiratory Rate, Weight Note

### Step 4: Clinical Findings
- **Chief Complaint** - Primary reason for visit (Required)
- **Duration of Symptoms** (e.g., "3 days", "2 weeks")
- **History of Present Illness** - Detailed description (Required)
- **Past Medical History** - Previous illnesses
- **General Examination** - Physical findings
- **Systemic Examination** - CVS, RS, CNS findings

### Step 5: Diagnosis
- Enter **Provisional Diagnosis** (initial assessment)
- Enter **Final Diagnosis** (if confirmed)
- Add **ICD-10 Codes** (optional)

### Step 6: Treatment & Prescription
- Click **Add Medicine** button
- For each medicine, fill in:
  - **Drug Name** (Required)
  - **Strength** (e.g., 500mg, 5ml) (Required)
  - **Route** (Oral, IV, IM, etc.) (Required)
  - **Frequency** (OD, BD, TID, etc.) (Required)
  - **Dose** (e.g., 1 tablet) (Required)
  - **Duration** (e.g., 5 days) (Required)
  - **Instructions** (e.g., "After food")
- Add multiple medicines as needed
- Delete medicine: Click trash icon on medicine card
- Enter **Treatment Notes** (advice, precautions)

### Step 7: Investigations
- Select **Investigation Urgency** (Routine, Urgent, STAT)
- Lab and radiology orders will integrate with respective modules

### Step 8: Billing & Payment
- Enter **Consultation Fee** (Required)
- Enter **Investigation Estimate** (optional)
- Enter **Procedure Charges** (optional)
- Enter **Discount Amount** (optional)
- **Total Payable** auto-calculates
- Select **Payment Mode** (Cash, Card, UPI, Insurance, TPA)
- Select **Payment Status** (Paid, Pending, Refunded)

#### If Payment Mode = Insurance:
- **Insurance Company** field appears (Required)
- **Policy Number** field appears (Required)
- Check **Pre-authorization Required** if needed

### Step 9: Follow Up
- Enter **Follow-up Date** (optional)
- Enter **Follow-up Instructions** (optional)
- Check **Refer to IPD** if patient needs admission

#### If Refer to IPD is checked:
- **Referral Note** field appears (Required, minimum 5 characters)
- Enter detailed reason for IPD admission

### Step 10: Submit
- Review all sections
- Click **Submit Visit** button
- Wait for confirmation
- Success dialog shows Visit ID

## Post-Submission Actions

### In Success Dialog:
- **Print** - Print visit summary (opens print dialog)
- **View Details** - Navigate to visit details page
- **Create New Visit** - Clear form and start new visit

## Auto-Save Feature

### How It Works:
- Form auto-saves to browser storage every 30 seconds
- Look for badge in top-right:
  - "Saving..." (in progress)
  - "Saved" (completed)

### Draft Restoration:
- If you close the browser before submitting
- On return, you'll see: "Restore unsaved OPD visit from [timestamp]?"
- Click **OK** to restore draft
- Click **Cancel** to discard draft and start fresh

## Tips & Best Practices

### Patient Search:
- Start typing patient name, UHID, or phone
- Results appear instantly
- Select correct patient before proceeding
- Double-check patient details after selection

### Doctor Selection:
- Choose department first for filtered doctor list
- Check doctor availability in time slots
- Yellow slots = overbooking (proceed with caution)
- Red slots = blocked (cannot select)

### Vitals Entry:
- BMI calculates automatically from height & weight
- Blood pressure format: systolic/diastolic (e.g., 120/80)
- Use numeric keypad for faster entry
- All vitals marked with * are required

### Prescription Entry:
- Add at least one medicine (required for treatment section)
- Use standard abbreviations:
  - OD = Once daily
  - BD = Twice daily
  - TID = Three times daily
  - QID = Four times daily
  - SOS = As needed
- Be specific in instructions (e.g., "After food", "Before sleep")

### Billing:
- Consultation fee is typically required
- Investigation estimate is optional (for transparency)
- Total payable updates automatically
- For insurance patients, ensure company and policy are filled

### Follow-up:
- Suggest follow-up days in Visit section (auto-calculates date)
- Use follow-up instructions for patient guidance
- IPD referral requires detailed note (minimum 5 characters)

## Collapsible Sections

All 9 sections are collapsible to reduce screen clutter:
- Click section header to expand/collapse
- Chevron icon indicates state (up = expanded, down = collapsed)
- Focus on one section at a time for better UX

## Keyboard Shortcuts

- **Tab** - Move to next field
- **Shift + Tab** - Move to previous field
- **Enter** - Submit form (when on submit button)
- **Escape** - Close dropdowns and dialogs

## Common Issues & Solutions

### Issue: Patient search not working
**Solution:** Ensure you're typing at least 2 characters. Check network connection.

### Issue: Doctor list is empty
**Solution:** Select a department first. Doctors filter by department.

### Issue: Time slots not showing
**Solution:** Ensure doctor is selected and visit date is set. Check if doctor has slots for selected date.

### Issue: BMI not calculating
**Solution:** Enter both height (cm) and weight (kg). BMI calculates automatically.

### Issue: Cannot submit form
**Solution:** Check for validation errors (red text below fields). All required fields (*) must be filled.

### Issue: Insurance fields not showing
**Solution:** Ensure "Insurance" is selected as Payment Mode. Fields appear conditionally.

### Issue: Referral note not showing
**Solution:** Check the "Refer to IPD" checkbox first. Note field appears conditionally.

### Issue: Draft not restoring
**Solution:** Auto-save occurs every 30 seconds. If you close browser before first auto-save, no draft exists.

## Validation Rules Reference

| Field | Rule |
|-------|------|
| Phone | 10-15 digits only |
| Email | Valid email format |
| Age | 0-150 years |
| Blood Pressure | Format: 120/80 (systolic/diastolic) |
| Temperature | 30-45°C |
| Pulse Rate | 30-220 bpm |
| SpO2 | 50-100% |
| Height | 20-300 cm |
| Weight | 0.5-500 kg |
| Prescription | At least 1 medicine required |
| Insurance Company | Required when payment mode = Insurance |
| Policy Number | Required when payment mode = Insurance |
| Referral Note | Required when "Refer to IPD" is checked, minimum 5 characters |

## Form Sections Summary

1. **Registration** - Patient demographics
2. **Visit & Doctor** - Department, doctor, appointment details
3. **Vitals** - Height, weight, BP, temperature, etc.
4. **Clinical Findings** - Complaints, history, examination
5. **Diagnosis** - Provisional and final diagnosis
6. **Treatment** - Prescriptions and treatment plan
7. **Investigations** - Lab and radiology orders
8. **Billing** - Fees, payment mode, insurance
9. **Follow Up** - Next visit and IPD referral

## Support

For technical issues or questions:
- Contact: Hospital IT Support
- Email: support@hospital.com
- Extension: 1234

---

**Happy Consulting! 🏥**

*Last Updated: October 27, 2025*
