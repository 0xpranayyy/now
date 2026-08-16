# NOW — Repository Structure

```text
now/
├── app/
│   ├── (marketing)/
│   ├── (product)/
│   │   ├── now/
│   │   ├── map/
│   │   ├── discover/
│   │   ├── profile/
│   │   └── moment/[id]/
│   ├── api/
│   └── admin/
├── components/
│   ├── ui/
│   ├── moment/
│   ├── feed/
│   ├── map/
│   └── navigation/
├── features/
│   ├── moments/
│   ├── feed/
│   ├── presence/
│   ├── posts/
│   ├── places/
│   ├── events/
│   ├── profiles/
│   ├── notifications/
│   └── moderation/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── geo/
│   ├── realtime/
│   ├── storage/
│   └── analytics/
├── jobs/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
└── public/
```

## Rule

A feature folder should own its business logic. Shared utilities are for genuinely shared concerns, not as a dumping ground.

Avoid:

```text
utils/everything.ts
helpers/misc.ts
services/random.ts
```

Prefer explicit names such as:

```text
features/moments/ranking.ts
features/moments/lifecycle.ts
features/presence/aggregation.ts
lib/geo/distance.ts
```
