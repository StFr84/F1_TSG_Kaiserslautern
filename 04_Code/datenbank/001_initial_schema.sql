create extension if not exists "pgcrypto";

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('trainer', 'parent')),
  created_at timestamptz default now() not null
);
alter table public.profiles enable row level security;
create policy "Own profile readable" on public.profiles for select using (auth.uid() = id);
create policy "Own profile updatable" on public.profiles for update using (auth.uid() = id);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now() not null
);
alter table public.teams enable row level security;
create policy "Teams readable by auth users" on public.teams for select using (auth.role() = 'authenticated');

-- Players
create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams on delete cascade not null,
  first_name text not null,
  birth_year int not null,
  parent_id uuid references public.profiles on delete set null,
  created_at timestamptz default now() not null
);
alter table public.players enable row level security;
create policy "Players readable by team members" on public.players
  for select using (auth.role() = 'authenticated');
create policy "Players manageable by trainers" on public.players
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'trainer')
  );

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams on delete cascade not null,
  type text not null check (type in ('training', 'game', 'other')),
  title text not null,
  starts_at timestamptz not null,
  location text,
  opponent text,
  meetup_at timestamptz,
  rsvp_deadline timestamptz,
  created_by uuid references public.profiles not null,
  created_at timestamptz default now() not null
);
alter table public.events enable row level security;
create policy "Events readable by auth users" on public.events for select using (auth.role() = 'authenticated');
create policy "Events manageable by trainers" on public.events
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'trainer')
  );

-- RSVPs
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events on delete cascade not null,
  player_id uuid references public.players on delete cascade not null,
  status text not null check (status in ('attending', 'absent')),
  reason text,
  updated_at timestamptz default now() not null,
  unique (event_id, player_id)
);
alter table public.rsvps enable row level security;
create policy "RSVPs readable by auth users" on public.rsvps for select using (auth.role() = 'authenticated');
create policy "RSVPs manageable by parent or trainer" on public.rsvps
  for all using (
    exists (
      select 1 from public.players pl
      where pl.id = rsvps.player_id
      and (
        pl.parent_id = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'trainer')
      )
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Unbekannt'),
    coalesce(new.raw_user_meta_data->>'role', 'parent')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
