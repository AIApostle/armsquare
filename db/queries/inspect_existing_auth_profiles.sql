select
    count(*) as auth_user_count,
    count(*) filter (
        where coalesce(raw_user_meta_data ->> 'role', 'user') = 'user'
          and nullif(trim(raw_user_meta_data ->> 'display_name'), '') is not null
          and char_length(trim(raw_user_meta_data ->> 'display_name')) <= 120
    ) as valid_user_profiles,
    count(*) filter (
        where raw_user_meta_data ->> 'role' = 'business'
          and nullif(trim(raw_user_meta_data ->> 'display_name'), '') is not null
          and char_length(trim(raw_user_meta_data ->> 'display_name')) <= 120
          and nullif(trim(raw_user_meta_data ->> 'business_name'), '') is not null
          and char_length(trim(raw_user_meta_data ->> 'business_name')) <= 160
    ) as valid_business_profiles,
    count(*) filter (
        where not (
            (
                coalesce(raw_user_meta_data ->> 'role', 'user') = 'user'
                and nullif(trim(raw_user_meta_data ->> 'display_name'), '') is not null
                and char_length(trim(raw_user_meta_data ->> 'display_name')) <= 120
            )
            or (
                raw_user_meta_data ->> 'role' = 'business'
                and nullif(trim(raw_user_meta_data ->> 'display_name'), '') is not null
                and char_length(trim(raw_user_meta_data ->> 'display_name')) <= 120
                and nullif(trim(raw_user_meta_data ->> 'business_name'), '') is not null
                and char_length(trim(raw_user_meta_data ->> 'business_name')) <= 160
            )
        )
    ) as users_without_valid_profile_metadata
from auth.users;
