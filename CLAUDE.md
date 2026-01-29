# Mosque Community App - Complete Project Context

> This document contains everything a coding agent needs to build this application. It includes project overview, development approach, database schema, and project structure.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Feature Scope](#feature-scope)
4. [Key Design Decisions](#key-design-decisions)
5. [Development Approach](#development-approach)
6. [Database Schema](#database-schema)
7. [Project Structure](#project-structure)
8. [Code Patterns & Key Files](#code-patterns--key-files)
9. [Build Order](#build-order)
10. [Notes for the Agent](#notes-for-the-agent)

---

## Project Overview

You are building a mobile application for a local mosque community. The app serves as a central hub for prayer times, announcements, events, lectures, donations, and contact services.

**Core philosophy:** Build a focused, well-executed app that does a few things excellently rather than many things poorly. Prioritize reliability, ease of use, and maintainability.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo (managed workflow) |
| Routing | Expo Router (file-based) |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| State | React Context + custom hooks |
| Payments | Stripe React Native SDK |
| Notifications | Expo Notifications |
| Language | TypeScript (strict mode) |

---

## Feature Scope

### Phase 1 - Public Information Layer (No Auth)
- Prayer times display (admin-managed, real-time updates)
- Announcements/news feed with detail views
- Events listing and detail views
- Lectures with links to YouTube/Facebook
- Contact section with email links by category

### Phase 2 - User Features (Auth Required)
- User authentication (email/password)
- One-time donations via Stripe
- Event registration with capacity limits
- User profile and history
- Push notification preferences

### Phase 3 - Admin Features
- In-app content management for admins
- CRUD operations for prayer times, announcements, events, lectures
- View event registrations

---

## Key Design Decisions

These decisions have been made. Do not revisit or question them unless you encounter a blocking issue:

- **Prayer times:** Single row per prayer type, admin updates manually when times change. Not a calendar of daily entries.
- **Donations:** One-time only, single donation pool, no tax receipts, amounts stored in cents.
- **Events:** Free events only, capacity limits supported, no waitlists or tickets.
- **Auth pattern:** Guest access for viewing content, auth required for transactions (donations, event registration).
- **Admin access:** Boolean `is_admin` flag on profiles table. Admins set manually via Supabase dashboard.
- **Contact:** Opens native email client via `Linking.openURL()`. No in-app message storage.
- **Notification preferences:** Per-prayer toggles for adhan alerts, plus toggles for events and announcements.

---

## Development Approach

### Test-Driven Development

Follow this cycle for each feature:

```
1. Write failing test(s) that define expected behavior
2. Implement minimum code to pass tests
3. Refactor while keeping tests green
4. Move to next feature
```

**Testing priorities:**
- Unit tests for hooks and utility functions
- Integration tests for Supabase queries
- Component tests for critical UI flows
- E2E tests for user journeys (auth, donation, registration)

**Testing tools:**
- Jest (unit/integration)
- React Native Testing Library (components)
- Detox or Maestro (E2E, optional for MVP)

### Iterative Implementation

Build vertically, not horizontally. Complete one feature end-to-end before starting the next:

```
✅ Good: Prayer times → full implementation with tests → Announcements → ...
❌ Bad: All screens scaffolded → all hooks written → all tests added
```

Each iteration should result in working, tested functionality.

### When You Encounter Problems

1. **If a library doesn't work as expected:** Check for Expo compatibility, look for alternatives, document the issue and your solution.

2. **If the schema needs adjustment:** Make the change, document why, and note any migration considerations.

3. **If a design decision seems wrong in practice:** Implement it as specified first. If it genuinely doesn't work, explain the issue and propose an alternative.

4. **If you're unsure about UI/UX details:** Make reasonable decisions that prioritize simplicity and accessibility. Note assumptions for review.

---

## Database Schema

We're using Supabase (PostgreSQL) as the backend, which gives us:
- Managed PostgreSQL database
- Built-in authentication
- Row-level security (RLS) for permissions
- Real-time subscriptions (useful for live prayer time updates)
- Storage for images
- Edge functions if we need serverless logic later

### 1. Profiles (extends Supabase Auth)

Supabase handles authentication with its `auth.users` table. We create a `profiles` table to store additional user data and admin status.

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  is_admin boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Automatically create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Why this approach?**
- Keeps auth concerns separate from app data
- `is_admin` flag is simple — for a small mosque, you don't need complex role hierarchies
- The trigger ensures every authenticated user gets a profile automatically

### 2. Prayer Times

Mosques typically display 5 daily prayers plus special prayers (Jummah, Taraweeh). Times change seasonally and the admin updates them manually.

```sql
create table prayer_times (
  id uuid default gen_random_uuid() primary key,
  prayer_name text not null,           -- 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Jummah', 'Taraweeh'
  adhan_time time,                      -- When the adhan is called
  iqama_time time not null,             -- When congregation starts (this is what most people care about)
  is_active boolean default true,       -- For seasonal prayers like Taraweeh
  display_order integer not null,       -- Controls display sequence
  notes text,                           -- Optional: "Sisters' prayer room available"
  updated_at timestamp with time zone default now()
);

-- Seed with standard prayers
insert into prayer_times (prayer_name, iqama_time, display_order) values
  ('Fajr', '06:00', 1),
  ('Dhuhr', '13:30', 2),
  ('Asr', '16:30', 3),
  ('Maghrib', '18:45', 4),
  ('Isha', '20:30', 5),
  ('Jummah', '13:15', 6),
  ('Taraweeh', '21:30', 7);
```

**Design decisions:**
- Single row per prayer type (not per day) — admin just updates times when they change
- `is_active` lets you hide Taraweeh outside Ramadan without deleting it
- `adhan_time` is optional since some mosques only publish iqama times
- `display_order` keeps the list in proper sequence

### 3. Announcements

News, updates, and general communications from the mosque.

```sql
create table announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  image_url text,                       -- Optional hero image (stored in Supabase Storage)
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  created_by uuid references profiles(id)
);

-- Index for fetching published announcements efficiently
create index idx_announcements_published 
  on announcements(published_at desc) 
  where is_published = true;
```

**Notes:**
- `is_published` lets admins draft announcements before making them live
- `published_at` controls the display order (newest first)

### 4. Events

Community events with optional capacity limits.

```sql
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  location text,                        -- "Main prayer hall", "Community center", etc.
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  capacity integer,                     -- NULL means unlimited
  is_published boolean default false,
  created_at timestamp with time zone default now(),
  created_by uuid references profiles(id)
);

create index idx_events_upcoming 
  on events(start_time) 
  where is_published = true;
```

### 5. Event Registrations

Links users to events they've registered for.

```sql
create table event_registrations (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  registered_at timestamp with time zone default now(),
  
  -- Prevent duplicate registrations
  unique(event_id, user_id)
);

-- Useful for checking registration counts
create index idx_registrations_by_event on event_registrations(event_id);
```

**Checking capacity before registration** (do this in application code or an RLS policy):
```sql
-- Example query to check if event has space
select 
  e.capacity,
  count(r.id) as registered_count,
  e.capacity - count(r.id) as spots_remaining
from events e
left join event_registrations r on r.event_id = e.id
where e.id = 'some-event-id'
group by e.id;
```

### 6. Donations

One-time donations processed via Stripe.

```sql
create table donations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  amount_cents integer not null,        -- Store in cents to avoid floating point issues
  currency text default 'CAD',
  stripe_payment_intent_id text,        -- Links to Stripe for reconciliation
  status text not null default 'pending', -- 'pending', 'completed', 'failed'
  created_at timestamp with time zone default now()
);

create index idx_donations_by_user on donations(user_id, created_at desc);
```

**Why `amount_cents`?**
- Financial amounts should never use floats
- $50.00 is stored as `5000`
- Display logic: `(amount_cents / 100).toFixed(2)`

### 7. Lectures

Links to YouTube/Facebook videos.

```sql
create table lectures (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  video_url text not null,              -- YouTube or Facebook URL
  thumbnail_url text,                   -- Can auto-extract from YouTube or upload custom
  speaker text,                         -- Optional: imam name
  published_date date,
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  created_by uuid references profiles(id)
);

create index idx_lectures_published 
  on lectures(published_date desc) 
  where is_published = true;
```

### 8. Contact Categories

For handling funeral arrangements, marriage services, general consulting, etc.

```sql
create table contact_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,                   -- 'Funeral Services', 'Marriage', 'General Inquiry'
  description text,                     -- Brief explanation shown to users
  contact_email text,                   -- Where requests get sent
  display_order integer not null
);

-- Seed standard categories
insert into contact_categories (name, description, contact_email, display_order) values
  ('Funeral Services', 'Janazah prayers and burial arrangements', 'funeral@mosque.com', 1),
  ('Marriage Services', 'Nikah ceremonies and marriage counseling', 'marriage@mosque.com', 2),
  ('Religious Consultation', 'Questions about Islamic practice', 'imam@mosque.com', 3),
  ('General Inquiry', 'Other questions or feedback', 'info@mosque.com', 4);
```

The contact form opens the native email client via `Linking.openURL('mailto:...')`.

### 9. Push Notification Preferences

For users who want prayer time alerts or event notifications.

```sql
create table notification_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  expo_push_token text not null,        -- Expo's push notification token
  
  -- Granular preferences
  prayer_fajr boolean default false,
  prayer_dhuhr boolean default false,
  prayer_asr boolean default false,
  prayer_maghrib boolean default false,
  prayer_isha boolean default false,
  prayer_jummah boolean default true,   -- Most people want Jummah reminders
  
  event_reminders boolean default true,
  announcements boolean default true,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, expo_push_token)
);
```

**Note:** Push notifications require a backend process to actually send them. Options:
- Supabase Edge Functions + Expo Push API
- Scheduled cron job (Supabase supports `pg_cron`)
- External service like OneSignal

### Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table prayer_times enable row level security;
alter table announcements enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table donations enable row level security;
alter table lectures enable row level security;
alter table contact_categories enable row level security;
alter table notification_preferences enable row level security;

-- Public read access (no auth required)
create policy "Anyone can view prayer times"
  on prayer_times for select using (true);

create policy "Anyone can view published announcements"
  on announcements for select using (is_published = true);

create policy "Anyone can view published events"
  on events for select using (is_published = true);

create policy "Anyone can view published lectures"
  on lectures for select using (is_published = true);

create policy "Anyone can view contact categories"
  on contact_categories for select using (true);

-- Authenticated user policies
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can view their own registrations"
  on event_registrations for select using (auth.uid() = user_id);

create policy "Users can register for events"
  on event_registrations for insert with check (auth.uid() = user_id);

create policy "Users can cancel their registrations"
  on event_registrations for delete using (auth.uid() = user_id);

create policy "Users can view their own donations"
  on donations for select using (auth.uid() = user_id);

create policy "Users can manage their notification preferences"
  on notification_preferences for all using (auth.uid() = user_id);

-- Admin policies (check is_admin flag in profiles)
create policy "Admins can manage prayer times"
  on prayer_times for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can manage announcements"
  on announcements for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can manage events"
  on events for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can view all registrations"
  on event_registrations for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can manage lectures"
  on lectures for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐
│ auth.users  │──────▶│     profiles     │
└─────────────┘       │  - is_admin      │
                      └────────┬─────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌──────────────┐
│   donations   │    │ event_          │    │ notification_│
│               │    │ registrations   │    │ preferences  │
└───────────────┘    └────────┬────────┘    └──────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │    events     │
                      └───────────────┘

Standalone tables (admin-managed):
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐
│ prayer_times  │  │ announcements │  │   lectures    │  │contact_categories│
└───────────────┘  └───────────────┘  └───────────────┘  └──────────────────┘
```

---

## Project Structure

### Initialization Commands

```bash
# Create new Expo project with Expo Router
npx create-expo-app@latest mosque-app --template tabs

cd mosque-app

# Install core dependencies
npx expo install @supabase/supabase-js
npx expo install expo-secure-store        # For storing auth tokens securely
npx expo install expo-notifications       # Push notifications
npx expo install expo-linking             # For email links, video URLs
npx expo install @stripe/stripe-react-native

# Install UI helpers
npx expo install expo-image               # Better image loading
npx expo install react-native-safe-area-context  # Usually included already
```

### Folder Structure

```
mosque-app/
├── app/                              # Expo Router - file-based routing
│   ├── _layout.tsx                   # Root layout (providers, nav container)
│   ├── index.tsx                     # Redirect to /home or /prayer-times
│   │
│   ├── (tabs)/                       # Main tab navigator (public screens)
│   │   ├── _layout.tsx               # Tab bar configuration
│   │   ├── prayer-times.tsx          # Prayer times display
│   │   ├── announcements/
│   │   │   ├── index.tsx             # Announcements list
│   │   │   └── [id].tsx              # Single announcement detail
│   │   ├── events/
│   │   │   ├── index.tsx             # Events calendar/list
│   │   │   └── [id].tsx              # Event detail + registration
│   │   ├── lectures/
│   │   │   ├── index.tsx             # Lectures list
│   │   │   └── [id].tsx              # Lecture detail (embedded video)
│   │   └── more.tsx                  # More menu (contact, donate, profile)
│   │
│   ├── (auth)/                       # Auth screens (unauthenticated only)
│   │   ├── _layout.tsx               # Auth layout (no tabs)
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (protected)/                  # Requires authentication
│   │   ├── _layout.tsx               # Auth guard wrapper
│   │   ├── donate.tsx                # Donation flow
│   │   ├── profile/
│   │   │   ├── index.tsx             # User profile
│   │   │   ├── donations.tsx         # Donation history
│   │   │   ├── registrations.tsx     # Event registrations
│   │   │   └── notifications.tsx     # Notification preferences
│   │   └── (admin)/                  # Admin-only screens
│   │       ├── _layout.tsx           # Admin guard wrapper
│   │       ├── index.tsx             # Admin dashboard
│   │       ├── prayer-times.tsx      # Edit prayer times
│   │       ├── announcements/
│   │       │   ├── index.tsx         # Manage announcements
│   │       │   └── [id].tsx          # Edit/create announcement
│   │       ├── events/
│   │       │   ├── index.tsx         # Manage events
│   │       │   └── [id].tsx          # Edit/create event
│   │       └── lectures/
│   │           ├── index.tsx         # Manage lectures
│   │           └── [id].tsx          # Edit/create lecture
│   │
│   ├── contact.tsx                   # Contact categories + email links
│   └── +not-found.tsx                # 404 screen
│
├── src/
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── prayer/                   # Prayer-specific components
│   │   │   ├── PrayerTimeCard.tsx
│   │   │   ├── PrayerTimesList.tsx
│   │   │   └── NextPrayerBanner.tsx
│   │   │
│   │   ├── announcements/
│   │   │   ├── AnnouncementCard.tsx
│   │   │   └── AnnouncementsList.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventsList.tsx
│   │   │   ├── RegistrationButton.tsx
│   │   │   └── CapacityBadge.tsx
│   │   │
│   │   ├── lectures/
│   │   │   ├── LectureCard.tsx
│   │   │   ├── LecturesList.tsx
│   │   │   └── VideoPlayer.tsx
│   │   │
│   │   ├── donations/
│   │   │   ├── AmountSelector.tsx
│   │   │   └── DonationForm.tsx
│   │   │
│   │   └── admin/
│   │       ├── AdminGuard.tsx        # Redirects non-admins
│   │       ├── FormField.tsx
│   │       └── ImagePicker.tsx
│   │
│   ├── contexts/                     # React Context providers
│   │   ├── AuthContext.tsx           # User auth state
│   │   └── NotificationContext.tsx   # Push notification handling
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useAuth.ts                # Auth helpers
│   │   ├── usePrayerTimes.ts         # Fetch + cache prayer times
│   │   ├── useAnnouncements.ts
│   │   ├── useEvents.ts
│   │   ├── useLectures.ts
│   │   ├── useEventRegistration.ts
│   │   └── useAdmin.ts               # Admin status check
│   │
│   ├── lib/                          # Utilities and clients
│   │   ├── supabase.ts               # Supabase client setup
│   │   ├── stripe.ts                 # Stripe initialization
│   │   ├── notifications.ts          # Push notification helpers
│   │   ├── storage.ts                # Async storage helpers
│   │   └── utils.ts                  # General utilities
│   │
│   ├── types/                        # TypeScript types
│   │   ├── database.ts               # Generated from Supabase or manual
│   │   └── navigation.ts             # Route params
│   │
│   └── constants/                    # App constants
│       ├── colors.ts                 # Theme colors
│       ├── layout.ts                 # Spacing, sizing
│       └── config.ts                 # API URLs, feature flags
│
├── __tests__/                        # Test files (mirror src structure)
│
├── assets/                           # Static assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── mosque-placeholder.png
│   │   └── icons/
│   └── fonts/                        # Custom fonts if needed
│
├── app.json                          # Expo configuration
├── eas.json                          # EAS Build configuration
├── tsconfig.json
├── package.json
└── .env                              # Environment variables (gitignored)
```

### Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

---

## Code Patterns & Key Files

### Supabase Client (`src/lib/supabase.ts`)

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Secure storage adapter for auth tokens
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Auth Context (`src/contexts/AuthContext.tsx`)

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setIsLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isLoading,
        isAdmin: profile?.is_admin ?? false,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Root Layout (`app/_layout.tsx`)

```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
      <AuthProvider>
        <NotificationProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(protected)" />
          </Stack>
        </NotificationProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
```

### Tab Layout (`app/(tabs)/_layout.tsx`)

```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="prayer-times"
        options={{
          title: 'Prayer Times',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lectures"
        options={{
          title: 'Lectures',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Data Fetching Hook Pattern (`src/hooks/usePrayerTimes.ts`)

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PrayerTime } from '@/types/database';

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrayerTimes();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('prayer_times_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prayer_times' },
        () => fetchPrayerTimes()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPrayerTimes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('prayer_times')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      setError(error.message);
    } else {
      setPrayerTimes(data || []);
    }
    setIsLoading(false);
  };

  return { prayerTimes, isLoading, error, refetch: fetchPrayerTimes };
}
```

### Admin Guard (`src/components/admin/AdminGuard.tsx`)

```typescript
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.replace('/sign-in');
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [isAdmin, isLoading, session]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
```

### Protected Route Layout (`app/(protected)/_layout.tsx`)

```typescript
export default function ProtectedLayout() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/sign-in');
    }
  }, [session, isLoading]);

  if (isLoading || !session) return <LoadingSpinner />;
  return <Stack />;
}
```

### Component Structure Pattern

```typescript
// Props interface at top
interface PrayerTimeCardProps {
  prayer: PrayerTime;
  isNext?: boolean;
}

// Functional component with explicit return
export function PrayerTimeCard({ prayer, isNext }: PrayerTimeCardProps) {
  return (
    // JSX
  );
}

// Styles at bottom
const styles = StyleSheet.create({
  // ...
});
```

---

## Navigation Flow

```
App Launch
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC (No Auth Required)                 │
│  ┌─────────┐  ┌──────┐  ┌────────┐  ┌──────────┐  ┌──────┐ │
│  │ Prayer  │  │ News │  │ Events │  │ Lectures │  │ More │ │
│  │ Times   │  │      │  │        │  │          │  │      │ │
│  └─────────┘  └──────┘  └────────┘  └──────────┘  └──────┘ │
│                                                              │
│  More Menu Contains:                                         │
│  • Contact Us (public)                                       │
│  • Donate → requires auth                                    │
│  • Profile → requires auth                                   │
│  • Sign In / Sign Up                                         │
│  • Admin Panel → requires auth + is_admin                    │
└─────────────────────────────────────────────────────────────┘
                              │
                    User taps "Donate" or
                    "Register for Event"
                              │
                              ▼
                    ┌─────────────────┐
                    │  Auth Required  │
                    │                 │
                    │  Sign In / Up   │
                    └────────┬────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 PROTECTED (Auth Required)                    │
│                                                              │
│  • Donation flow (Stripe checkout)                          │
│  • Event registration                                        │
│  • Profile management                                        │
│  • Notification preferences                                  │
│  • Donation history                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                    User is admin?
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ADMIN (is_admin = true)                      │
│                                                              │
│  • Edit prayer times                                         │
│  • Manage announcements (CRUD)                              │
│  • Manage events (CRUD)                                      │
│  • Manage lectures (CRUD)                                    │
│  • View event registrations                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Build Order

This is a suggested order. Adapt as needed:

### Phase 1 - Public Information Layer
1. Project setup (Expo init, dependencies, Supabase client)
2. Theme and base UI components
3. Prayer times (hook, components, screen, tests)
4. Announcements (hook, components, list/detail screens, tests)
5. Lectures (hook, components, list/detail screens, tests)
6. Contact section
7. Tab navigation and "More" menu

### Phase 2 - User Features
8. Auth context and screens
9. Protected route wrapper
10. Donations flow (Stripe integration)
11. Event registration
12. User profile screens
13. Push notification setup

### Phase 3 - Admin Features
14. Admin guard component
15. Prayer times admin screen
16. Announcements admin CRUD
17. Events admin CRUD
18. Lectures admin CRUD

---

## Quality Standards

### Code
- TypeScript strict mode, no `any` types without justification
- Explicit return types on functions
- Meaningful variable and function names
- Small, focused functions and components
- Comments for non-obvious logic, not for obvious code

### Testing
- Tests should be readable as documentation
- Test behavior, not implementation
- Each test should have a single reason to fail
- Use descriptive test names: `it('shows error message when registration fails')`

### Git
- Small, atomic commits
- Commit message format: `type(scope): description`
  - Types: feat, fix, test, refactor, docs, chore
  - Example: `feat(prayer-times): add real-time subscription`

---

## Notes for the Agent

- **Be pragmatic.** Working software over perfect architecture.
- **Communicate blockers.** If something isn't working, explain what you tried and what failed.
- **Make reasonable assumptions** for unspecified details (spacing, colors, copy). Note them for review.
- **Don't over-engineer.** This is a community app, not enterprise SaaS. Simple solutions are preferred.
- **Test the happy path first**, then add edge case handling.
- **Keep accessibility in mind.** Proper labels, sufficient contrast, touch target sizes.

When in doubt, ship something that works and iterate.
