# NOW — System Architecture

## 1. Architecture decision

Start as a **modular monolith**.

Do not use microservices for MVP.

The first architecture:

```text
                    ┌─────────────────────┐
                    │    NOW PWA / Web    │
                    │ Mobile + Desktop    │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │       Next.js       │
                    │                     │
                    │ UI / SSR / API      │
                    │ Auth / validation   │
                    └──────┬─────────┬────┘
                           │         │
             ┌─────────────▼─┐    ┌─▼──────────────┐
             │   Supabase    │    │    Mapbox      │
             │               │    │                │
             │ PostgreSQL    │    │ maps           │
             │ Auth          │    │ geocoding      │
             │ Realtime      │    │ places         │
             │ Storage       │    └────────────────┘
             └───────┬───────┘
                     │
              ┌──────▼──────┐
              │ Background  │
              │ Jobs/Workers│
              └──────┬──────┘
                     │
          ┌──────────▼──────────┐
          │ Analytics/Monitoring│
          │ PostHog / Sentry    │
          └─────────────────────┘
```

## 2. Application modules

Keep domain boundaries inside the monolith.

```text
src/
├── app/
├── features/
│   ├── feed/
│   ├── moments/
│   ├── presence/
│   ├── posts/
│   ├── reactions/
│   ├── places/
│   ├── events/
│   ├── profiles/
│   ├── notifications/
│   ├── search/
│   └── moderation/
├── components/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── geo/
│   ├── realtime/
│   ├── storage/
│   └── analytics/
├── jobs/
└── tests/
```

Each feature owns:

- domain types
- validation
- queries/mutations
- UI
- tests

Avoid a giant generic `utils` dump.

## 3. Request path

```text
Browser
  ↓
Next.js route
  ↓
authentication
  ↓
input validation
  ↓
authorization
  ↓
domain operation
  ↓
database
  ↓
analytics/event emission
  ↓
response
```

Never let UI components directly mutate database tables.

## 4. Caching

Use caching selectively:

### Safe to cache

- public place metadata
- event details
- public archived moments
- static configuration

### Keep fresh

- active participant counts
- live chat
- moment activity
- user permissions

The home feed can tolerate a small amount of staleness.

## 5. Database authority

PostgreSQL is the source of truth for persistent state.

Realtime is a delivery mechanism, not the primary database.

For example:

```text
Realtime presence
      ↓
aggregated active count
      ↓
PostgreSQL moment.participant_count
```

## 6. Geographic queries

Use PostGIS.

Primary pattern:

```text
user coordinates
    ↓
bounding / radius filter
    ↓
active moments
    ↓
ranking
    ↓
feed
```

Do not scan the full moments table.

## 7. Moment lifecycle

```text
DRAFT
  ↓
UPCOMING
  ↓
LIVE
  ↓
COOLING_DOWN
  ↓
ARCHIVED
```

Transitions are server controlled.

`expires_at` is mandatory for live moments.

## 8. Background job categories

- expire moments
- refresh trending
- aggregate participant counts
- generate event moments
- detect activity clusters
- deliver notifications
- process media
- cleanup stale presence
- aggregate analytics

## 9. Long-term service extraction

Only split services when one of these becomes true:

- independent scaling requirement
- deployment coupling hurts velocity
- reliability isolation is required
- team ownership requires it
- infrastructure profile is materially different

Candidate future services:

- Realtime presence
- Feed/ranking
- Media
- Notifications
- Search
