# 🐴 TimeHorse - AI Calendar with Supabase & Google Integration

A modern AI-powered calendar application built with Next.js, featuring natural language scheduling, Supabase authentication, and Google Calendar integration.

## Features

✅ **Google OAuth Authentication** with Calendar API access  
✅ **Natural Language Scheduling** - Type commands like "Schedule coffee with Sarah next Tuesday"  
✅ **Supabase Backend** - Secure event storage with Row Level Security  
✅ **Optimistic UI Updates** - Events appear instantly before database confirmation  
✅ **Google Calendar Sync** - Access to user's Google Calendar via provider token  
✅ **OpenRouter/Gemma 3 27B AI** - Free AI API for parsing natural language commands  
✅ **Beautiful Weekly Timeline** - Responsive calendar interface  
✅ **Real-time Updates** - Automatic sync between UI and database

## Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui
-   **Icons**: Lucide React
-   **Authentication**: Supabase Auth
-   **Database**: Supabase (PostgreSQL)
-   **AI**: OpenRouter (Gemma 3 27B - Free API)
-   **Date Handling**: date-fns

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=your-openrouter-key
```

4. Run the migration in Supabase SQL Editor: `supabase/migrations/001_create_events_table.sql`

### 3. Configure Google OAuth

1. Enable Google Calendar API in [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Enable Google provider in Supabase Auth with scope: `https://www.googleapis.com/auth/calendar`

### 4. Get OpenRouter API Key (Free)

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Get your free API key
3. Use model: `google/gemma-3-27b-it:free`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Key Features

### Google OAuth with Calendar Access

```typescript
import { signInWithGoogle, getGoogleProviderToken } from "@/lib/supabase/auth";

// Sign in with calendar scope
await signInWithGoogle();

// Get provider token for Google Calendar API
const { providerToken } = await getGoogleProviderToken();
```

### OpenRouter/Gemma AI Integration

```typescript
import { insertEventFromAI } from "@/lib/supabase/events";

const aiResponse = {
    title: "Team Meeting",
    start_time: "2026-01-10T14:00:00Z",
    end_time: "2026-01-10T15:00:00Z",
    description: "Discuss Q1 goals",
};

const event = await insertEventFromAI(aiResponse);
```

### Optimistic UI Updates

```typescript
const { addEventOptimistically, confirmEvent } = useOptimisticEvents();

// Add immediately to UI
const cleanup = addEventOptimistically(newEvent);

try {
    const saved = await insertManualEvent(eventData);
    confirmEvent(newEvent.id, saved);
} catch (error) {
    cleanup(); // Rollback on error
}
```

## Magic Bar Commands

Try these natural language commands:

-   "Schedule a 1-hour coffee with Sarah next Tuesday"
-   "Block 2 hours tomorrow for deep work"
-   "Meeting with team every Monday at 10am"
-   "Schedule dentist appointment next Friday at 2:30pm"

## Project Structure

```
app/
  page.tsx              # Main dashboard
  auth/callback/        # OAuth callback
components/
  calendar/             # Calendar components
  magic-bar/            # Command input
lib/
  supabase/            # Supabase clients & functions
  ai-parser.ts         # Natural language parsing
  calendar-utils.ts    # Calendar helpers
hooks/
  useOptimisticEvents.ts  # Optimistic UI state
supabase/
  migrations/          # Database schema
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenRouter (Gemma 3 27B - Free API)
OPENROUTER_API_KEY=your-openrouter-key
```

## Deploy on Vercel

```bash
vercel --prod
```

Add environment variables in Vercel dashboard and update OAuth redirect URLs.

## License

MIT

---

Built with ❤️ using Next.js, Supabase, OpenRouter, and shadcn/ui
