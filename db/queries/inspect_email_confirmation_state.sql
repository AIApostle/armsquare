select
    count(*) as auth_user_count,
    count(*) filter (where email_confirmed_at is not null) as email_confirmed_count,
    count(*) filter (where email_confirmed_at is null) as pending_confirmation_count
from auth.users;
