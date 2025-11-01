# Admin Tour Management Testing Checklist

## Test Environment
- Frontend: http://localhost:5174
- Backend: (should be running on configured port)
- Page URL: http://localhost:5174/my-guide-tours

## Prerequisites
1. ✅ Backend server running
2. ✅ Frontend running on port 5174
3. ✅ Admin user account available for login

## Test Cases

### Test 1: Admin Sees All Tours
**Steps:**
1. Log in as admin user
2. Navigate to "My Guide Tours" page (http://localhost:5174/my-guide-tours)

**Expected Results:**
- ✅ Page heading shows "All Tours (Admin)"
- ✅ Subtitle shows "Manage all tours on the platform (X tours)"
- ✅ ALL tours in database are displayed (not just tours admin is assigned to)
- ✅ Tour count matches total tours in database

### Test 2: Edit Tour Button Visibility
**Steps:**
1. On My Guide Tours page as admin
2. Observe each tour card

**Expected Results:**
- ✅ Blue "Edit" button appears on EVERY tour card
- ✅ Clicking "Edit" navigates to `/tours/edit/:id`
- ✅ Edit page loads successfully for any tour

### Test 3: Delete Tour Functionality
**Steps:**
1. On My Guide Tours page as admin
2. Observe each tour card

**Expected Results:**
- ✅ Red "Delete" button appears on EVERY tour card
- ✅ Clicking "Delete" shows confirmation dialog
- ✅ Confirming deletion removes tour from list
- ✅ Backend successfully deletes tour

### Test 4: Manage Tour Capacity
**Steps:**
1. On My Guide Tours page as admin
2. Click green "Manage" button on any tour
3. Update capacity field (e.g., change from 15 to 20)
4. Click "Update Capacity"

**Expected Results:**
- ✅ Green "Manage" button appears on EVERY tour card
- ✅ Management panel opens showing current capacity
- ✅ Capacity input accepts values 1-50
- ✅ Clicking "Update Capacity" successfully updates backend
- ✅ Success message appears
- ✅ Updated capacity reflects in UI

### Test 5: View Participants
**Steps:**
1. On My Guide Tours page as admin
2. Click "View Participants" on any tour with bookings

**Expected Results:**
- ✅ "View Participants" button on every tour
- ✅ Participant list shows all bookings for that tour
- ✅ Check-in/check-out status displayed
- ✅ Can perform check-in/check-out operations

### Test 6: Manage Guides
**Steps:**
1. On My Guide Tours page as admin
2. Click "Manage" on any tour
3. Scroll to "Assigned Guides" section
4. Try assigning a guide by email
5. Try unassigning a guide

**Expected Results:**
- ✅ Current guides list visible in management panel
- ✅ Can enter guide email and click "Assign"
- ✅ Guide successfully added to tour
- ✅ Can click "Unassign" to remove guide
- ✅ Confirmation dialog for unassign action

### Test 7: Create New Tour
**Steps:**
1. On My Guide Tours page as admin
2. Click "Create New Tour" button

**Expected Results:**
- ✅ "Create New Tour" button visible at top
- ✅ Button navigates to `/tours/create`
- ✅ Tour creation form loads

### Test 8: Lead-Guide Comparison (Regression Test)
**Steps:**
1. Log in as lead-guide user
2. Navigate to My Guide Tours page

**Expected Results:**
- ✅ Page heading shows "My Guide Tours" (not "All Tours")
- ✅ Subtitle shows "Tours you are assigned to guide"
- ✅ Only sees tours where they are the FIRST assigned guide
- ✅ Edit/Manage/Delete buttons ONLY on tours they lead
- ✅ No management access to other tours

### Test 9: Regular Guide Comparison (Regression Test)
**Steps:**
1. Log in as regular guide user
2. Navigate to My Guide Tours page

**Expected Results:**
- ✅ Page heading shows "My Guide Tours"
- ✅ Only sees tours where they are assigned as guide
- ✅ NO Edit/Manage/Delete buttons (not lead guide)
- ✅ Can only view participants

## API Endpoints Used
- `GET /tours` - Fetches all tours (admin)
- `GET /tours/my-guide-tours` - Fetches assigned tours (guides)
- `PATCH /tours/:id` - Update tour details
- `DELETE /tours/:id` - Delete tour
- `PATCH /tours/:id/capacity` - Update capacity
- `POST /tours/:id/guides` - Assign guide
- `DELETE /tours/:id/guides/:guideId` - Unassign guide
- `GET /tours/:id/participants` - View bookings

## Known Issues
None expected. All TypeScript compilation errors resolved.

## Success Criteria
All 9 test cases pass without errors. Admin has full CRUD access to ALL tours from the My Guide Tours page.
