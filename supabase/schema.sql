-- Enable PostGIS for geospatial features
create extension if not exists postgis;

-- 1. Users
create table users (
  id uuid primary key references auth.users(id),
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  home_city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security (RLS) for users
alter table users enable row level security;
create policy "Users can read all profiles" on users for select using (true);
create policy "Users can update their own profile" on users for update using (auth.uid() = id);

-- Trigger for users created_at
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, username, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Places
create table places (
  id uuid primary key default gen_random_uuid(),
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
);

create index places_geom_gist on places using gist (geom);
alter table places enable row level security;
create policy "Places are readable by everyone" on places for select using (true);


-- 3. Events
create table events (
  id uuid primary key default gen_random_uuid(),
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

alter table events enable row level security;
create policy "Events are readable by everyone" on events for select using (true);


-- 4. Moments
create table moments (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references users(id),
  place_id uuid references places(id),
  event_id uuid references events(id),
  title text not null,
  description text,
  latitude double precision,
  longitude double precision,
  geom geography(point, 4326),
  category text not null,
  visibility text not null default 'public',
  status text not null default 'LIVE',
  started_at timestamptz,
  expires_at timestamptz not null,
  participant_count integer not null default 0,
  post_count integer not null default 0,
  trending_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index moments_status_expires on moments(status, expires_at);
create index moments_geom_gist on moments using gist (geom);
create index moments_category_status on moments(category, status);

alter table moments enable row level security;
create policy "Moments are readable by everyone" on moments for select using (visibility = 'public');
create policy "Users can create moments" on moments for insert with check (auth.uid() = creator_id);
create policy "Users can update their own moments" on moments for update using (auth.uid() = creator_id);


-- 5. Moment membership
create table moment_members (
  moment_id uuid references moments(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  state text not null,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key(moment_id, user_id)
);

alter table moment_members enable row level security;
create policy "Memberships are readable by everyone" on moment_members for select using (true);
create policy "Users can manage their own memberships" on moment_members for all using (auth.uid() = user_id);


-- 6. Posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references moments(id) on delete cascade,
  author_id uuid not null references users(id),
  body text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table posts enable row level security;
create policy "Posts are readable by everyone" on posts for select using (deleted_at is null);
create policy "Users can create posts" on posts for insert with check (auth.uid() = author_id);


-- 7. Reactions
create table reactions (
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now(),
  primary key(post_id, user_id, kind)
);

alter table reactions enable row level security;
create policy "Reactions are readable by everyone" on reactions for select using (true);
create policy "Users can manage their own reactions" on reactions for all using (auth.uid() = user_id);
