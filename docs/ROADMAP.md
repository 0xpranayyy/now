# NOW — Product & Engineering Roadmap

## Phase 0 — prototype

Goal:

Prove the interaction model.

Deliver:

- premium UI
- moments
- feed
- map
- moment detail
- simulated data

No backend complexity.

## Phase 1 — private alpha

Goal:

Validate the core loop with real people.

Build:

- Supabase
- auth
- real profiles
- real moments
- location
- real posts
- sharing
- basic analytics
- moderation
- admin

Limit to one dense market.

Success question:

> Do users return because something interesting is happening?

## Phase 2 — live product

Goal:

Make the product feel alive.

Build:

- realtime presence
- live participant counts
- chat
- reactions
- trending
- event ingestion
- stronger map

## Phase 3 — network density

Goal:

Solve cold start.

Build:

- place intelligence
- event seeding
- better moment discovery
- shareable moment URLs
- QR entry
- notification system
- city-level dashboards

## Phase 4 — automatic moments

Goal:

Reduce dependency on manual creation.

Build:

- activity clustering
- geo-temporal clustering
- topic detection
- automatic moment generation
- quality/confidence thresholds

## Phase 5 — personalization

Goal:

Make NOW feel personally relevant.

Build:

- follows
- interest graph
- social relevance
- personalized ranking
- notifications

Do not jump to ML before sufficient behavioral data exists.

## Phase 6 — native clients

Only after:

- repeat usage is proven
- notification demand is proven
- background/presence capabilities are clearly valuable
- web distribution has been optimized

Use Expo / React Native first unless native-only capabilities justify separate Swift/Kotlin clients.

## Phase 7 — scale

Only when real traffic requires it.

Possible additions:

- Redis
- queue infrastructure
- search service
- feed service
- dedicated realtime presence
- CDN/media pipeline
- regional architecture

## What must not happen

Do not let:

- architecture ambition
- feature requests
- competitor anxiety
- premature hiring
- vanity metrics

pull engineering away from the core loop.

The roadmap is evidence-driven.
