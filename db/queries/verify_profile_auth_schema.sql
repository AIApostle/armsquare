select
    to_regclass('public.profiles')::text as profiles_table,
    exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = 'role'
    ) as has_role_column,
    coalesce(
        (
            select c.relrowsecurity
            from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public'
              and c.relname = 'profiles'
        ),
        false
    ) as row_level_security_enabled,
    exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'profiles'
          and policyname = 'Users can read their own profile'
    ) as own_profile_read_policy_exists,
    exists (
        select 1
        from information_schema.role_table_grants
        where table_schema = 'public'
          and table_name = 'profiles'
          and grantee = 'authenticated'
          and privilege_type = 'SELECT'
    ) as authenticated_role_can_select;
