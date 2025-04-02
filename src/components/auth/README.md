# Authentication Flow

## User Flow

1. **New Users**:
   - Visit the landing page
   - Click "Get Started" or "Sign Up"
   - Complete the sign-up form
   - After successful sign-up, they are redirected to the dashboard

2. **Returning Users**:
   - Visit the landing page
   - Click "Sign In"
   - Enter credentials
   - After successful login, they are redirected to the dashboard

## Technical Implementation

The authentication system uses multiple fallback mechanisms to ensure reliability:

1. **Primary Method**: Edge Function
   - Uses Supabase service role for admin privileges
   - Bypasses client-side auth issues
   - Directly creates users and authenticates them

2. **Fallback Method**: Standard Supabase Auth
   - Uses the standard Supabase auth client
   - Works when edge functions are unavailable

3. **Database Functions**:
   - SQL functions with SECURITY DEFINER privilege
   - Direct database access for user creation and verification
   - Bypasses RLS restrictions

## Troubleshooting

If authentication issues occur:

1. Check browser console for detailed error messages
2. Verify Supabase environment variables are correctly set
3. Ensure the user table exists and RLS is disabled
4. Check if the edge functions are deployed correctly

## Notes

- Email verification is currently bypassed for easier testing
- User profiles are created automatically on sign-up
- The pricing table in the landing page is synced with the database
