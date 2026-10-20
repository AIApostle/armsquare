create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null check (char_length(display_name) between 1 and 120),
    role text not null check (role in ('user', 'business')),
    business_name text check (business_name is null or char_length(business_name) <= 160),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
    on public.profiles
    for select
    to authenticated
    using ((select auth.uid()) = id);

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    account_role text := coalesce(new.raw_user_meta_data ->> 'role', 'user');
    profile_name text := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
    profile_business_name text := nullif(trim(new.raw_user_meta_data ->> 'business_name'), '');
begin
    if account_role not in ('user', 'business') then
        raise exception 'Unsupported account role';
    end if;

    if profile_name is null then
        raise exception 'Display name is required';
    end if;

    if account_role = 'business' and profile_business_name is null then
        raise exception 'Business name is required for business accounts';
    end if;

    insert into public.profiles (id, display_name, role, business_name)
    values (new.id, profile_name, account_role, profile_business_name);
    return new;
end;
$$;

revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;

drop trigger if exists create_profile_after_auth_user_insert on auth.users;
create trigger create_profile_after_auth_user_insert
    after insert on auth.users
    for each row execute function public.create_profile_for_auth_user();
