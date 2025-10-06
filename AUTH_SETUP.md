# Authentication Setup Guide

This document describes the authentication system that has been integrated with the backend API.

## Overview

The hardcoded authentication has been replaced with actual backend API integration. The system now uses:
- JWT tokens for authentication
- Secure token storage in localStorage
- Token refresh mechanism
- Backend API integration

## Environment Configuration

Create a `.env.local` file in the root of the project with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Update this URL to match your backend API endpoint.

## Architecture

### 1. API Client (`lib/api-client.ts`)
- Handles all HTTP requests to the backend
- Automatically includes JWT tokens in authenticated requests
- Provides methods for GET, POST, PUT, DELETE operations

### 2. Auth Service (`lib/auth.ts`)
- Manages authentication state
- Handles login, logout, register operations
- Stores and retrieves JWT tokens
- Manages user data in localStorage

### 3. Auth Context (`hooks/use-auth.tsx`)
- Provides authentication state to the entire app
- Exposes methods: `login`, `logout`, `register`, `refreshToken`, `updateProfile`
- Automatically checks token validity on app load

## User Model

The User interface has been updated to match the backend schema:

```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  avatar?: string | null
  phone?: string | null
  address?: string | null
  dateOfBirth?: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### User Roles

The system supports the following roles:
- `ADMIN` - System administrator
- `DOCTOR` - Medical doctor
- `NURSE` - Nursing staff
- `RECEPTIONIST` - Front desk staff
- `LAB_TECHNICIAN` - Laboratory technician
- `PHARMACIST` - Pharmacy staff
- `PATIENT` - Hospital patient

## Helper Functions

### `getUserFullName(user: User | null): string`
Returns the full name of a user by combining firstName and lastName.

### `getUserInitials(user: User | null): string`
Returns the initials of a user (e.g., "JD" for "John Doe").

### `getRoleDisplayName(role: UserRole): string`
Returns a human-readable name for a role (e.g., "Lab Technician" for "LAB_TECHNICIAN").

### `getRoleColor(role: UserRole): string`
Returns Tailwind CSS classes for displaying role badges with appropriate colors.

## API Endpoints

The authentication system uses the following backend endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user details
- `PUT /auth/profile` - Update user profile

## Usage Examples

### Login

```typescript
const { login } = useAuth()

try {
  await login('doctor@hospital.com', 'password123')
  router.push('/dashboard')
} catch (error) {
  console.error('Login failed:', error)
}
```

### Register

```typescript
const { register } = useAuth()

try {
  await register({
    email: 'newdoctor@hospital.com',
    password: 'securepassword',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'DOCTOR',
    phone: '+1234567890',
  })
  router.push('/dashboard')
} catch (error) {
  console.error('Registration failed:', error)
}
```

### Logout

```typescript
const { logout } = useAuth()

try {
  await logout()
  router.push('/')
} catch (error) {
  console.error('Logout failed:', error)
}
```

### Access User Data

```typescript
const { user, isAuthenticated, isLoading } = useAuth()

if (isLoading) {
  return <div>Loading...</div>
}

if (!isAuthenticated) {
  router.push('/')
  return null
}

return <div>Welcome, {getUserFullName(user)}!</div>
```

## Token Management

### Storage
- Access tokens are stored in `localStorage` under the key `accessToken`
- Refresh tokens are stored in `localStorage` under the key `refreshToken`
- User data is stored in `localStorage` under the key `user`

### Refresh Mechanism
The authentication context automatically:
1. Checks if a user is logged in on app load
2. Verifies the token by fetching user details from the API
3. Attempts to refresh the token if it's expired
4. Logs out the user if refresh fails

### Manual Token Refresh

```typescript
const { refreshToken } = useAuth()

try {
  await refreshToken()
} catch (error) {
  // Token refresh failed, user will be logged out
}
```

## Security Considerations

1. **HTTPS**: Always use HTTPS in production to secure token transmission
2. **Token Expiration**: Tokens should have short expiration times (e.g., 15 minutes for access, 7 days for refresh)
3. **Secure Storage**: Consider using httpOnly cookies for token storage in production
4. **CORS**: Ensure backend CORS settings allow requests from your frontend domain
5. **Password Requirements**: The register form includes password strength validation

## Backend Integration Checklist

- [ ] Backend API is running on the configured URL
- [ ] CORS is configured to allow requests from the frontend
- [ ] JWT tokens are being issued with appropriate expiration times
- [ ] All required endpoints are implemented and tested
- [ ] Database is set up with the correct schema

## Troubleshooting

### "Network error occurred"
- Check if the backend API is running
- Verify the `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### "Session expired. Please login again."
- The refresh token has expired or is invalid
- User needs to log in again

### Token not included in requests
- Ensure you're passing `includeAuth: true` to API client methods
- Check that tokens are stored in localStorage

## Migration Notes

The following changes were made from the hardcoded system:

1. **User Interface**: Changed from `{ name, role, department }` to `{ firstName, lastName, role, ... }`
2. **Role Values**: Changed from lowercase strings to uppercase enum values (e.g., `"doctor"` → `"DOCTOR"`)
3. **Authentication**: Removed mock users and implemented real API calls
4. **Token Storage**: Replaced `hospital_user` key with `user`, `accessToken`, and `refreshToken` keys
5. **Type Safety**: All components updated to use the new User interface and UserRole enum

## Next Steps

1. Test login flow with actual backend
2. Test registration with different roles
3. Verify token refresh mechanism
4. Test logout functionality
5. Implement protected routes based on roles
6. Add error handling for network failures
7. Implement remember me functionality (optional)
8. Add multi-factor authentication (optional)
