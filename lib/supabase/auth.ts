import { createClient } from '@/lib/supabase/client';

/**
 * Sign in with Google OAuth requesting calendar scope
 * This allows us to access the user's Google Calendar
 */
export async function signInWithGoogle() {
  const supabase = createClient();
  
  // Use the current origin for redirect (works for both localhost and production)
  const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : '/auth/callback';
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      scopes: 'https://www.googleapis.com/auth/calendar',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }

  return data;
}

/**
 * Get the current session and extract provider_token
 * The provider_token is the Google OAuth token that can be used
 * to make requests to Google Calendar API
 */
export async function getGoogleProviderToken() {
  const supabase = createClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    throw error;
  }

  if (!session) {
    throw new Error('No active session');
  }

  // The provider_token is the Google OAuth access token
  const providerToken = session.provider_token;
  const providerRefreshToken = session.provider_refresh_token;

  return {
    providerToken,
    providerRefreshToken,
    user: session.user,
  };
}

/**
 * Fetch Google Calendar events using the provider token
 */
export async function fetchGoogleCalendarEvents() {
  const { providerToken } = await getGoogleProviderToken();

  if (!providerToken) {
    throw new Error('No provider token available. User may need to re-authenticate.');
  }

  // Fetch events from Google Calendar API
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        Authorization: `Bearer ${providerToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Google Calendar events');
  }

  const data = await response.json();
  return data.items;
}

/**
 * Sign out the user
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the current user with session refresh
 */
export async function getUser() {
  const supabase = createClient();
  
  // First, try to refresh the session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Error getting session:', sessionError);
    return null;
  }
  
  // If no session, user is not logged in
  if (!session) {
    return null;
  }
  
  // Try to refresh the session if it's close to expiring
  const expiresAt = session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
  
  // Refresh if less than 5 minutes remaining
  if (timeUntilExpiry < 300) {
    const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error('Error refreshing session:', refreshError);
      return null;
    }
    if (newSession?.user) {
      return newSession.user;
    }
  }
  
  // Get user from current session
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}
