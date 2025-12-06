# PM-AJAY Portal - Backend Integration Documentation

## Overview
This document outlines all backend integrations, API connections, and real-time features implemented in the PM-AJAY Portal.

## Real-Time Features

### Real-Time Service (`src/lib/realtime-service.ts`)
A comprehensive service for managing Supabase real-time subscriptions across all critical tables.

**Key Features:**
- Automatic subscription management
- Filter support for user-specific data
- Clean unsubscribe functionality
- Type-safe subscription callbacks

**Supported Tables:**
- `notifications` - Real-time notification updates
- `grievances` - Grievance status changes
- `proposals` - Proposal status updates
- `agency_proposals` - Agency proposal updates
- `course_registrations_new` - Course registration status changes
- `funds_allocation` - Fund allocation updates
- `scheme_beneficiaries` - Beneficiary data updates

### Real-Time Hooks (`src/hooks/use-realtime.ts`)
React hooks for easy integration of real-time features in components.

**Available Hooks:**
- `useRealtimeSubscription` - Generic real-time subscription
- `useRealtimeGrievances` - Real-time grievance updates
- `useRealtimeProposals` - Real-time proposal updates
- `useRealtimeAgencyProposals` - Real-time agency proposal updates
- `useRealtimeCourseRegistrations` - Real-time course registration updates
- `useRealtimeFunds` - Real-time fund allocation updates
- `useRealtimeBeneficiaries` - Real-time beneficiary data updates

## Authentication System

### Auth Context (`src/contexts/AuthContext.tsx`)
Enhanced authentication context with real-time notification support.

**Features:**
- User session management
- Real-time unread notification counter
- Automatic notification subscription on login
- Secure logout with cleanup

**Usage:**
```typescript
const { user, isAuthenticated, unreadNotifications, refreshNotifications, logout } = useAuth();
```

### Auth Service (`src/lib/auth-service.ts`)
Complete authentication service with OTP-based verification.

**Available Functions:**
- `initiateRegistration` - Start user registration with OTP
- `verifyRegistrationOTP` - Complete registration after OTP verification
- `initiateLogin` - Start login process with OTP
- `verifyLoginOTP` - Complete login after OTP verification
- `resendOTP` - Resend OTP for registration or login
- `checkEmailExists` - Check if email is already registered
- `getAllUsers` - Fetch all users (admin only)

## API Service Layer

### Core API Service (`src/lib/api-service.ts`)
Comprehensive API service with all backend integration points.

**Fund Management:**
- `fetchFundsData` - Get fund allocation data with filters
- `getUniqueStates` - Get unique state values
- `getUniqueYears` - Get unique year values
- `getUniqueAgencies` - Get unique agency values
- `getUniqueComponents` - Get unique component values

**Scheme Management:**
- `fetchSchemeData` - Get beneficiary data with filters
- `fetchAgencyData` - Get combined agency data (funds + beneficiaries)

**Course Management:**
- `fetchCourses` - Get active courses
- `fetchColleges` - Get colleges with course availability
- `submitCourseRegistration` - Submit old format course registration
- `fetchCourseRegistrationsNew` - Get new format registrations with joins
- `submitCourseRegistrationNew` - Submit new format course registration
- `updateCourseRegistrationStatus` - Admin: Update registration status

**Grant Management:**
- `checkGrantEligibility` - Check eligibility for grants
- `fetchEligibilityChecks` - Get eligibility check history
- `saveEligibilityCheck` - Save eligibility check result

**Grievance Management:**
- `submitGrievance` - Submit new grievance
- `fetchUserGrievances` - Get user's grievance history
- `fetchAllGrievances` - Admin: Get all grievances
- `updateGrievanceStatus` - Admin: Update grievance status

**Proposal Management:**
- `submitProposal` - Submit new proposal
- `fetchAllProposals` - Admin: Get all proposals
- `updateProposalStatus` - Admin: Update proposal status
- `fetchAgencyProposals` - Get agency proposals
- `submitAgencyProposal` - Submit agency proposal
- `updateAgencyProposalStatus` - Admin: Update agency proposal status

**Notification Management:**
- `fetchNotifications` - Get user notifications
- `markNotificationAsRead` - Mark single notification as read
- `markAllNotificationsAsRead` - Mark all notifications as read
- `createNotification` - Create new notification

**Agency Management:**
- `fetchAgencies` - Get all agencies

### Notification Helper (`src/lib/notification-helper.ts`)
Helper functions for creating contextual notifications.

**Available Functions:**
- `sendNotification` - Generic notification sender
- `notifyProposalStatusChange` - Notify user of proposal status change
- `notifyGrievanceStatusChange` - Notify user of grievance status change
- `notifyCourseRegistrationStatusChange` - Notify user of registration status change
- `notifyNewProposal` - Notify admins of new proposal
- `notifyNewGrievance` - Notify admins of new grievance
- `notifySystemMaintenance` - Notify users of system maintenance

## React Query Hooks

### API Hooks (`src/hooks/use-api.ts`)
React Query hooks for data fetching with caching and automatic refetching.

**Query Hooks (Read Operations):**
- `useFundsData` - Fetch funds with filters
- `useSchemeData` - Fetch scheme data with filters
- `useCourses` - Fetch active courses
- `useColleges` - Fetch colleges
- `useAgencyData` - Fetch combined agency data
- `useAgencies` - Fetch all agencies
- `useUserGrievances` - Fetch user grievances
- `useAllGrievances` - Fetch all grievances (admin)
- `useAllProposals` - Fetch all proposals (admin)
- `useAgencyProposals` - Fetch agency proposals
- `useCourseRegistrationsNew` - Fetch course registrations
- `useNotifications` - Fetch notifications
- `useEligibilityChecks` - Fetch eligibility checks
- `useFilterOptions` - Fetch filter dropdown options

**Mutation Hooks (Write Operations):**
- `useGrantEligibility` - Check grant eligibility
- `useSubmitGrievance` - Submit grievance
- `useSubmitProposal` - Submit proposal
- `useUpdateProposal` - Update proposal (admin)
- `useUpdateGrievance` - Update grievance (admin)
- `useSubmitAgencyProposal` - Submit agency proposal
- `useUpdateAgencyProposal` - Update agency proposal (admin)
- `useSubmitCourseRegistrationNew` - Submit course registration
- `useUpdateCourseRegistration` - Update course registration (admin)
- `useMarkNotificationRead` - Mark notification as read
- `useMarkAllNotificationsRead` - Mark all notifications as read
- `useSaveEligibilityCheck` - Save eligibility check
- `useSubmitRegistration` - Submit old format registration

## Components

### Notification Center (`src/components/NotificationCenter.tsx`)
A complete notification center with real-time updates.

**Features:**
- Real-time notification count badge
- Filter by read/unread
- Click to navigate to relevant page
- Mark single or all notifications as read
- Priority-based color coding
- Time ago formatting

**Usage:**
```typescript
import { NotificationCenter } from "@/components/NotificationCenter";

// Add to your layout
<NotificationCenter />
```

## Database Schema

### Key Tables
- `portal_users` - User accounts (administrator, agency, citizen)
- `notifications` - User notifications with real-time updates
- `grievances` - Grievance tracking system
- `proposals` - Project proposals
- `agency_proposals` - Agency-specific proposals
- `course_registrations_new` - Course registration system
- `eligibility_checks` - Grant eligibility checks
- `funds_allocation` - Fund allocation tracking
- `scheme_beneficiaries` - Beneficiary tracking
- `courses` - Available courses
- `colleges` - College information
- `otp_store` - OTP verification for auth

## Environment Variables

Required environment variables (already configured):
```
VITE_SUPABASE_URL - Supabase project URL
VITE_SUPABASE_ANON_KEY - Supabase anonymous key
```

## Real-Time Updates Flow

1. **User Login:**
   - AuthContext establishes notification subscription
   - Unread count updates automatically

2. **Data Changes:**
   - Admin updates proposal/grievance/registration status
   - Real-time subscription triggers in user's browser
   - React Query cache invalidated automatically
   - UI updates with new data
   - Notification created and delivered in real-time

3. **Notification Flow:**
   - Action occurs (e.g., proposal approved)
   - Notification helper creates notification in database
   - Real-time subscription fires in AuthContext
   - Unread count increments
   - NotificationCenter shows new notification
   - User clicks notification → marked as read → count decrements

## Best Practices

### Using Real-Time Features
```typescript
// In a component
import { useRealtimeProposals } from "@/hooks/use-realtime";
import { useAllProposals } from "@/hooks/use-api";

function ProposalsList() {
  const { data: proposals } = useAllProposals();

  // Automatic real-time updates
  useRealtimeProposals();

  return <div>{/* Render proposals */}</div>;
}
```

### Creating Notifications
```typescript
import { notifyProposalStatusChange } from "@/lib/notification-helper";

// After updating proposal status
await updateProposalStatus(proposalId, "approved", notes, reviewerId);
await notifyProposalStatusChange(
  userId,
  "Solar Panel Installation",
  "approved",
  "/agency/proposals"
);
```

### Error Handling
All API functions throw errors that should be caught:
```typescript
try {
  const result = await submitProposal(proposalData);
  toast.success("Proposal submitted successfully!");
} catch (error) {
  console.error(error);
  toast.error("Failed to submit proposal");
}
```

## Performance Optimization

- React Query caching reduces API calls
- Real-time subscriptions are cleaned up on unmount
- Stale time configured appropriately per data type
- Queries disabled when dependencies not met
- Automatic refetching on window focus

## Security Features

- Row Level Security (RLS) enabled on all tables
- User-specific data filtering in subscriptions
- OTP-based authentication
- Password hashing (basic - should use bcrypt in production)
- Secure session management
- Automatic cleanup on logout

## Migration from Static Data

For pages currently using static data, follow this pattern:
```typescript
// Before
const [data, setData] = useState(staticData);

// After
import { useFundsData } from "@/hooks/use-api";
import { useRealtimeFunds } from "@/hooks/use-realtime";

const { data, isLoading } = useFundsData(filters);
useRealtimeFunds(); // Automatic real-time updates
```

## Testing Real-Time Features

1. Open the app in two browser windows
2. Login as admin in one, user in another
3. Make changes as admin (update status, etc.)
4. Watch real-time updates in user window
5. Check notification center for instant notifications

## Future Enhancements

- WebSocket fallback for older browsers
- Offline support with local caching
- Push notifications for mobile
- Email notifications for critical updates
- SMS notifications for urgent grievances
- Analytics dashboard for real-time metrics
