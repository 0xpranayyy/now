# NOW — Database Design

## 1. Principles

- PostgreSQL is authoritative.
- Every table has explicit ownership semantics.
- Soft-delete user-generated content where recovery/moderation requires it.
- Use UUIDs for public identifiers.
- Use timestamps in UTC.
- Add indexes based on real query patterns.
- Prefer normalized core data; use JSONB only for flexible external metadata.

## 2. Core entities

```text
users
places
events
moments
moment_members
posts
reactions
comments
follows
notifications
reports
blocks
media_assets
```

## 3. Users

```sql
users (
  id uuid primary key,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  home_city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

## 4. Places

```sql
places (
  id uuid primary key,
  provider text not null,
  provider_id text,
  name text not null,
  address text,
  category text,
  latitude double precision not null,
  longitude double precision not null,
  geom geography(point, 4326) not null,
  metadata jsonb,
  created_at timestamptz not null default now()
)
```

Create a spatial index:

```sql
create index places_geom_gist
on places
using gist (geom);
```

## 5. Events

```sql
events (
  id uuid primary key,
  place_id uuid references places(id),
  name text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  external_source text,
  external_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

## 6. Moments

```sql
moments (
  id uuid primary key,
  creator_id uuid references users(id),
  place_id uuid references places(id),
  event_id uuid references events(id),

  title text not null,
  description text,

  latitude double precision,
  longitude double precision,
  geom geography(point, 4326),

  category text not null,
  visibility text not null,

  status text not null,
  started_at timestamptz,
  expires_at timestamptz not null,

  participant_count integer not null default 0,
  post_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Indexes:

```sql
create index moments_status_expires
on moments(status, expires_at);

create index moments_geom_gist
on moments
using gist (geom);

create index moments_category_status
on moments(category, status);
```

## 7. Moment membership

```sql
moment_members (
  moment_id uuid references moments(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  state text not null,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key(moment_id, user_id)
);
```

Do not update `last_seen_at` on every UI repaint.

Throttle client presence updates.

## 8. Posts

```sql
posts (
  id uuid primary key,
  moment_id uuid not null references moments(id) on delete cascade,
  author_id uuid not null references users(id),
  body text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

Constraint:

At least one of `body` or media must exist.

## 9. Comments

Comments can be added after MVP if moment conversation already works.

Prefer:

```sql
comments (
  id uuid primary key,
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

## 10. Reactions

```sql
reactions (
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now(),
  primary key(post_id, user_id, kind)
);
```

## 11. Follows

```sql
follows (
  follower_id uuid references users(id) on delete cascade,
  following_id uuid references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id, following_id)
);
```

Prevent self-follow in application/database constraints.

## 12. Reports

```sql
reports (
  id uuid primary key,
  reporter_id uuid not null references users(id),
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
```

## 13. Blocks

```sql
blocks (
  blocker_id uuid references users(id) on delete cascade,
  blocked_id uuid references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id, blocked_id)
);
```

## 14. Privacy

Never store a user's continuously visible exact location as a social-history table by default.

If location history is later introduced, it needs an explicit product and privacy review.

## 15. Data retention

Define retention policies before launch.

Examples:

- stale presence: short-lived
- deleted post data: recoverable for moderation window
- audit logs: longer retention
- analytics: follow vendor policy and product requirements

Do not retain sensitive location history just because it is technically easy.
