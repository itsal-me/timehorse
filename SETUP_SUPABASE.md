# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down your:
    - Project URL (looks like: `https://xxxxx.supabase.co`)
    - Anon Key (public key)

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Run Database Migration

Go to your Supabase project dashboard:

1. Click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the entire content from `supabase/migrations/001_create_events_table.sql`
4. Click **Run** to execute the migration

This will:

-   Create the `events` table
-   Set up Row Level Security (RLS) policies
-   Create necessary indexes

## Step 4: Configure Google OAuth

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need to set up Google OAuth credentials:
    - Go to [Google Cloud Console](https://console.cloud.google.com)
    - Create a new project or select existing
    - Enable Google Calendar API
    - Create OAuth 2.0 credentials
    - Add authorized redirect URIs:
        - `https://your-project.supabase.co/auth/v1/callback`
        - `http://localhost:3000/auth/callback` (for development)
4. Copy Client ID and Client Secret to Supabase

## Step 5: Verify Setup

Run this SQL query in Supabase SQL Editor to verify the table exists:

```sql
SELECT * FROM events LIMIT 1;
```

Check RLS policies:

```sql
SELECT * FROM pg_policies WHERE tablename = 'events';
```

## Step 6: Test Authentication

1. Start your Next.js dev server: `npm run dev`
2. Try signing in with Google
3. Check browser console for any errors

## Troubleshooting

### Error: "relation 'events' does not exist"

→ Run the migration SQL from Step 3

### Error: "new row violates row-level security policy"

→ Make sure you're signed in and the RLS policies are created

### Error: "Failed to fetch"

→ Check that environment variables are set correctly in `.env.local`

### Events not saving

→ Check browser console for detailed error messages (we've added comprehensive logging)

### Still having issues?

Check the browser console for detailed error logs that show:

-   Error message
-   Error details
-   Error hint
-   Error code
-   Event data being sent

This information will help identify the exact issue.
