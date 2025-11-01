# Admin Tour Management UI/UX Implementation

## Overview
This document describes the implementation of full admin access to tour management features on the `/my-guide-tours` page.

## Problem Statement
Admin users had backend permissions to manage all tours but the frontend UI was not displaying:
- All tours (only showed tours admin was assigned to)
- Edit/Delete/Manage buttons for all tours

## Solution Implemented

### 1. Data Fetching Logic (`MyGuideTours.tsx` lines 15-24)
**Changed:** Conditional data fetching based on user role
- **Admin users:** Fetch from `useTours()` → GET `/tours` (returns ALL tours)
- **Guide users:** Fetch from `useMyGuideTours()` → GET `/tours/my-guide-tours` (returns assigned tours only)

```typescript
const isAdmin = currentUser?.role === 'admin';
const toursData = isAdmin ? allTours : guideTours;
const toursLoading = isAdmin ? allToursLoading : guideToursLoading;
const toursError = isAdmin ? allToursError : guideToursError;
```

### 2. Tour Management Permissions (`MyGuideTours.tsx` lines 74-83)
**Changed:** `isLeadGuide()` function now returns `true` for ALL tours when user is admin

```typescript
const isLeadGuide = (tour: any) => {
  // Admin has management access to ALL tours
  if (currentUser?.role === 'admin') return true;
  
  // Lead guide only manages tours where they are the first assigned guide
  return currentUser?.role === 'lead-guide' && 
         tour.guides && 
         tour.guides.length > 0 && 
         tour.guides[0]._id === currentUser._id;
};
```

### 3. Data Structure Normalization (`MyGuideTours.tsx` lines 102-104)
**Added:** Type-safe handling of different API response structures
- `useTours()` returns `Tour[]`
- `useMyGuideTours()` returns `{ data: { tours: GuideTour[] } }`

```typescript
const tours: (Tour | GuideTour)[] = isAdmin 
  ? ((toursData as Tour[]) || [])
  : ((toursData as { data: { tours: GuideTour[] } })?.data?.tours || []);
```

### 4. UI Updates
**Changed:** Page headings and empty states
- Admin sees: "All Tours (Admin)" instead of "My Guide Tours"
- Subtitle: "Manage all tours on the platform (X tours)" for admins
- Empty state: "No tours have been created yet." for admins

## Admin Capabilities on `/my-guide-tours` Page

When logged in as admin, the page now provides:

### ✅ View All Tours
- Admin sees every tour in the system (not just assigned tours)

### ✅ Edit Tour Details
- "Edit" button appears on ALL tour cards
- Links to `/tours/edit/:id` for any tour

### ✅ Delete Tour
- "Delete" button (red) appears on ALL tour cards
- Can delete any tour with confirmation dialog

### ✅ Manage Tour Capacity
- "Manage" button appears on ALL tour cards
- Can update `maxGroupSize` for any tour (1-50 participants)
- Shows current capacity and allows direct updates

### ✅ View Participants
- "View Participants" button on all tours
- Shows booking list with check-in/check-out status

### ✅ Manage Guides
- Can assign guides to any tour by email
- Can unassign any guide from any tour
- Views current guide assignments

### ✅ Create New Tour
- "Create New Tour" button visible (same as lead-guides)
- Links to `/tours/create`

## Backend Authorization
All backend endpoints properly authorize admin access:

1. **Tour CRUD Operations** (`backend/routes/tourRoutes.js` lines 50-77)
   - `POST /tours` - restrictTo('admin', 'lead-guide')
   - `PATCH /tours/:id` - restrictTo('admin', 'lead-guide')
   - `DELETE /tours/:id` - restrictTo('admin', 'lead-guide')

2. **Capacity Management** (`backend/controllers/tourController.js` line 468)
   - Checks: `if (!isLeadGuide && req.user.role !== 'admin')` → admin bypasses restriction

3. **Guide Assignment** (`backend/controllers/tourController.js` lines 504, 550)
   - assignGuideToTour: Admin can assign to any tour
   - unassignGuideFromTour: Admin can remove from any tour

## Testing
After implementation, verify:
1. ✅ Admin login → navigate to `/my-guide-tours`
2. ✅ Page displays ALL tours (not just assigned)
3. ✅ Edit/Manage/Delete buttons appear on every tour card
4. ✅ Capacity update works for any tour
5. ✅ Guide assignment/unassignment works for any tour
6. ✅ Tour deletion works with confirmation
7. ✅ Guide/lead-guide users still see only assigned tours

## Files Modified
1. `frontend/src/pages/MyGuideTours.tsx`
   - Added conditional data fetching (useTours vs useMyGuideTours)
   - Updated isLeadGuide() to grant admin full access
   - Normalized data structure handling
   - Updated UI text for admin context

## TypeScript Types
Added proper imports:
```typescript
import type { Tour } from '../services/tourService';
import type { GuideTour } from '../services/guideService';
```

## Related Documentation
- See `ADMIN_TOUR_PERMISSIONS_REPORT.md` for complete backend authorization audit
- See `backend/tests/tour-capacity-permissions.test.mjs` for capacity management tests
