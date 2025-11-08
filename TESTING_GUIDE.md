# Quick Start Guide - Testing IPD & Insurance Integration

## 🚀 Quick Start

### Step 1: Start Backend Server
```powershell
cd c:\Coding\internship\hms\hmsbackend
npm run start:dev
```

Wait for: `Application is running on: http://localhost:3001`

### Step 2: Start Frontend Server
```powershell
cd c:\Coding\internship\hms\hmsfrontend
npm run dev
```

Wait for: `Local: http://localhost:3000`

### Step 3: Access Billing Page
Open browser: `http://localhost:3000/billing`

---

## 🧪 Test Scenarios

### Test 1: View IPD Bills
1. Click "IPD Billing" tab
2. Check if statistics cards show data
3. Check if table loads (may be empty initially)

**Expected:**
- Statistics cards display (0 if no data)
- Table shows headers
- Empty state message if no bills

### Test 2: View Insurance Claims
1. Click "Insurance/TPA" tab
2. Check if statistics cards show data
3. Check if table loads (may be empty initially)

**Expected:**
- Statistics cards display (0 if no data)
- Table shows headers
- Empty state message if no claims

### Test 3: Create IPD Bill (Backend Test)
**Note:** IPD Bill creation dialog not yet added. Use backend API directly or test when dialog is implemented.

### Test 4: Record IPD Payment
**Prerequisites:** Need an existing IPD bill with pending balance

1. Go to IPD Billing tab
2. Find a bill with balance > 0
3. Click "Pay" button
4. Enter payment amount
5. Select payment method
6. Click "Record Payment"

**Expected:**
- Dialog opens with bill details
- Form validates amount
- Payment records successfully
- Balance updates
- Toast notification shows
- Table refreshes

### Test 5: Approve Insurance Claim
**Prerequisites:** Need a pending insurance claim

1. Go to Insurance/TPA tab
2. Find a claim with "PENDING" status
3. Click "Approve" button

**Expected:**
- API call made
- Status updates to "APPROVED"
- Toast notification shows
- Table refreshes

### Test 6: Reject Insurance Claim
**Prerequisites:** Need a pending insurance claim

1. Go to Insurance/TPA tab
2. Find a claim with "PENDING" status
3. Click "Reject" button

**Expected:**
- API call made
- Status updates to "REJECTED"
- Toast notification shows
- Table refreshes

---

## 🐛 Troubleshooting

### Issue: Tables are empty
**Solution:**
- Check backend has data in database
- Run test data scripts if available
- Check browser console for errors
- Verify API responses in Network tab

### Issue: API calls failing
**Solution:**
- Verify backend is running on port 3001
- Check CORS configuration
- Ensure environment variable `NEXT_PUBLIC_API_BASE_URL` is set
- Check backend logs for errors

### Issue: Toast notifications not showing
**Solution:**
- Check if `use-toast` hook is properly imported
- Verify toast container is rendered in layout
- Check console for React errors

### Issue: Payment dialog doesn't open
**Solution:**
- Check if bill has `balanceAmount > 0`
- Verify `showIPDPaymentDialog` state
- Check console for errors

---

## 📊 Backend Data Requirements

### For Testing IPD Billing:
You need in database:
1. **Admission** record
2. **IPDBilling** record linked to admission
3. **Patient** record linked to admission
4. **BedAssignment** linked to admission (optional but recommended)

### For Testing Insurance Claims:
You need in database:
1. **Admission** record
2. **InsuranceClaim** record linked to admission
3. **Patient** record linked to admission

---

## 🔧 Environment Setup

### Create `.env.local` file in frontend root:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Verify Backend Environment:
Check `hmsbackend/.env` has database configured correctly.

---

## ✅ Success Checklist

After testing, verify:
- [ ] IPD Billing tab loads without errors
- [ ] Insurance/TPA tab loads without errors
- [ ] Statistics cards show correct numbers
- [ ] Tables display data correctly
- [ ] Payment recording works
- [ ] Claim approval works
- [ ] Claim rejection works
- [ ] Toast notifications appear
- [ ] Loading states show during API calls
- [ ] Error messages display for failures
- [ ] Tab navigation works smoothly
- [ ] Data refreshes after operations

---

## 📝 Test Data Script (Optional)

If backend has test data scripts, run them:

```powershell
cd c:\Coding\internship\hms\hmsbackend
node test-ipd-billing.js
```

Or use Prisma Studio to manually create test data:

```powershell
cd c:\Coding\internship\hms\hmsbackend
npx prisma studio
```

---

## 🎯 Next Steps After Testing

1. **If tests pass:** Mark integration as complete ✅
2. **If tests fail:** Debug issues using troubleshooting guide
3. **Add missing features:**
   - IPD Bill creation dialog
   - Insurance claim creation dialog improvements
   - Print functionality
   - Export functionality

---

## 📞 Need Help?

- Check `INTEGRATION_COMPLETE.md` for detailed documentation
- Review implementation guides in `rishiguide/` folder
- Check backend logs for API errors
- Use browser DevTools Network tab to debug API calls

---

**Happy Testing! 🚀**
