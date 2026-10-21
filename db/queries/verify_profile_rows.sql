select
    count(users.id) as auth_user_count,
    count(profiles.id) as profile_count,
    count(*) filter (where profiles.id is null) as users_missing_profiles
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id;
