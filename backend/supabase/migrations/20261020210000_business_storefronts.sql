create table public.business_stores (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references public.profiles (id) on delete set null,
    name text not null check (char_length(name) between 2 and 160),
    slug text not null unique check (char_length(slug) between 2 and 180),
    tagline text not null check (char_length(tagline) between 2 and 180),
    description text not null check (char_length(description) between 1 and 2000),
    category_id text not null check (
        category_id in ('skin-care', 'arts-and-crafts', 'cycling')
    ),
    region text not null check (char_length(region) between 2 and 160),
    image_url text check (image_url is null or image_url like 'https://%'),
    is_published boolean not null default false,
    is_demo boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.business_members (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.business_stores (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    role text not null check (role in ('owner', 'manager', 'catalog_manager', 'staff')),
    created_at timestamptz not null default now(),
    unique (business_id, user_id)
);

create index business_members_user_id_idx on public.business_members (user_id, business_id);

create table public.business_agents (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null unique references public.business_stores (id) on delete cascade,
    name text not null check (char_length(name) between 2 and 120),
    capabilities text[] not null default array[
        'Answer questions from the published catalog',
        'Prepare product listing drafts'
    ]::text[],
    enabled_tools text[] not null default array[
        'catalog.read',
        'marketplace.search',
        'product.create_draft'
    ]::text[],
    autonomy_level text not null default 'draft'
        check (autonomy_level in ('read_only', 'recommend', 'draft')),
    is_paused boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.store_products (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.business_stores (id) on delete cascade,
    name text not null check (char_length(name) between 2 and 160),
    description text not null check (char_length(description) between 1 and 2000),
    price numeric(12, 2) not null check (price > 0),
    currency text not null default 'USD' check (currency = 'USD'),
    unit text not null default 'item' check (char_length(unit) between 1 and 40),
    availability text not null default 'in_stock'
        check (availability in ('in_stock', 'low_stock', 'made_to_order')),
    delivery text not null check (char_length(delivery) between 1 and 180),
    image_url text check (image_url is null or image_url like 'https://%'),
    is_published boolean not null default false,
    created_by_agent boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index store_products_business_public_idx
    on public.store_products (business_id, is_published, created_at desc);

alter table public.business_stores enable row level security;
alter table public.business_members enable row level security;
alter table public.business_agents enable row level security;
alter table public.store_products enable row level security;

revoke all on table public.business_stores from anon, authenticated;
revoke all on table public.business_members from anon, authenticated;
revoke all on table public.business_agents from anon, authenticated;
revoke all on table public.store_products from anon, authenticated;

grant select (
    id, name, slug, tagline, description, category_id, region, image_url,
    is_published, is_demo, created_at, updated_at
) on table public.business_stores to anon, authenticated;
grant insert (
    owner_id, name, slug, tagline, description, category_id, region, image_url, is_published
) on table public.business_stores to authenticated;
grant update (
    name, tagline, description, category_id, region, image_url, is_published
) on table public.business_stores to authenticated;
grant select on table public.business_members to anon, authenticated;
grant insert on table public.business_members to authenticated;
grant select (
    id, business_id, name, capabilities, autonomy_level, is_paused, created_at, updated_at
) on table public.business_agents to anon;
grant select (
    id, business_id, name, capabilities, enabled_tools, autonomy_level, is_paused,
    created_at, updated_at
) on table public.business_agents to authenticated;
grant insert (business_id, name) on table public.business_agents to authenticated;
grant update (enabled_tools, autonomy_level, is_paused) on table public.business_agents to authenticated;
grant select (
    id, business_id, name, description, price, currency, unit, availability, delivery,
    image_url, is_published, created_by_agent, created_at, updated_at
) on table public.store_products to anon, authenticated;
grant insert (
    business_id, name, description, price, currency, unit, availability, delivery,
    image_url, is_published, created_by_agent
) on table public.store_products to authenticated;
grant update (
    name, description, price, unit, availability, delivery, image_url, is_published
) on table public.store_products to authenticated;

create policy "Published stores and member stores are readable"
    on public.business_stores
    for select
    to anon, authenticated
    using (
        is_published
        or owner_id = (select auth.uid())
        or exists (
            select 1
            from public.business_members as member
            where member.business_id = id
              and member.user_id = (select auth.uid())
        )
    );

create policy "Business owners can create their stores"
    on public.business_stores
    for insert
    to authenticated
    with check (
        owner_id = (select auth.uid())
        and not is_demo
    );

create policy "Store managers can update their stores"
    on public.business_stores
    for update
    to authenticated
    using (
        exists (
            select 1
            from public.business_members as member
            where member.business_id = id
              and member.user_id = (select auth.uid())
              and member.role in ('owner', 'manager')
        )
    )
    with check (
        exists (
            select 1
            from public.business_members as member
            where member.business_id = id
              and member.user_id = (select auth.uid())
              and member.role in ('owner', 'manager')
        )
    );

create policy "Members can read their memberships"
    on public.business_members
    for select
    to authenticated
    using (user_id = (select auth.uid()));

create policy "Owners can add themselves to owned stores"
    on public.business_members
    for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and role = 'owner'
        and exists (
            select 1
            from public.business_stores as store
            where store.id = business_id
              and store.owner_id = (select auth.uid())
        )
    );

create policy "Published business agents are public"
    on public.business_agents
    for select
    to anon, authenticated
    using (
        exists (
            select 1
            from public.business_stores as store
            where store.id = business_id
              and store.is_published
        )
        or exists (
            select 1
            from public.business_members as member
            where member.business_id = business_id
              and member.user_id = (select auth.uid())
        )
    );

create policy "Owners can provision agents for their stores"
    on public.business_agents
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.business_members as member
            where member.business_id = business_id
              and member.user_id = (select auth.uid())
              and member.role = 'owner'
        )
    );

create policy "Store managers can update their agents"
    on public.business_agents
    for update
    to authenticated
    using (
        exists (
            select 1
            from public.business_members as member
            where member.business_id = business_id
              and member.user_id = (select auth.uid())
              and member.role in ('owner', 'manager')
        )
    )
    with check (
        exists (
            select 1
            from public.business_members as member
            where member.business_id = business_id
              and member.user_id = (select auth.uid())
              and member.role in ('owner', 'manager')
        )
    );

create policy "Published products and member products are readable"
    on public.store_products
    for select
    to anon, authenticated
    using (
        (
            is_published
            and exists (
                select 1
                from public.business_stores as store
                where store.id = business_id
                  and store.is_published
            )
        )
        or exists (
            select 1
            from public.business_members as member
            where member.business_id = business_id
              and member.user_id = (select auth.uid())
        )
    );

create policy "Store catalog managers can add products"
    on public.store_products
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.business_members as member
            where member.business_id = business_id
              and member.user_id = (select auth.uid())
              and member.role in ('owner', 'manager', 'catalog_manager')
        )
    );

create policy "Store catalog managers can update products"
    on public.store_products
    for update
    to authenticated
    using (
        exists (
            select 1
            from public.business_members as member
            where member.business_id = business_id
              and member.user_id = (select auth.uid())
              and member.role in ('owner', 'manager', 'catalog_manager')
        )
    )
    with check (
        exists (
            select 1
            from public.business_members as member
            where member.business_id = business_id
              and member.user_id = (select auth.uid())
              and member.role in ('owner', 'manager', 'catalog_manager')
        )
    );

create or replace function public.create_business_store(
    p_name text,
    p_tagline text,
    p_description text,
    p_category_id text,
    p_region text,
    p_image_url text default null,
    p_is_published boolean default false
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
    actor_id uuid := (select auth.uid());
    store_id uuid;
    store_slug text;
begin
    if actor_id is null or not exists (
        select 1
        from public.profiles as profile
        where profile.id = actor_id
          and profile.role = 'business'
    ) then
        raise exception 'A business account is required to create a store'
            using errcode = '42501';
    end if;

    store_slug := coalesce(
        nullif(
            trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g')),
            ''
        ),
        'store'
    ) || '-' || substr(gen_random_uuid()::text, 1, 8);

    insert into public.business_stores (
        owner_id,
        name,
        slug,
        tagline,
        description,
        category_id,
        region,
        image_url,
        is_published
    )
    values (
        actor_id,
        trim(p_name),
        store_slug,
        trim(p_tagline),
        trim(p_description),
        p_category_id,
        trim(p_region),
        p_image_url,
        p_is_published
    )
    returning id into store_id;

    insert into public.business_members (business_id, user_id, role)
    values (store_id, actor_id, 'owner');

    insert into public.business_agents (business_id, name)
    values (store_id, trim(p_name) || ' assistant');

    return store_id;
end;
$$;

revoke all on function public.create_business_store(text, text, text, text, text, text, boolean)
    from public, anon;
grant execute on function public.create_business_store(text, text, text, text, text, text, boolean)
    to authenticated;

insert into public.business_stores (
    id, name, slug, tagline, description, category_id, region, image_url, is_published, is_demo
)
values
    (
        'a1000000-0000-4000-8000-000000000001',
        'Clearwater Bath Works',
        'clearwater-bath-works-demo',
        'Everyday bath and skin care',
        'A fictional armsquare demo shop with sample soap and bath products.',
        'skin-care',
        'Portland, Oregon',
        'https://picsum.photos/seed/armsquare-bath-shop/1200/900',
        true,
        true
    ),
    (
        'a1000000-0000-4000-8000-000000000002',
        'Sunday Field Studio',
        'sunday-field-studio-demo',
        'Tools for making things by hand',
        'A fictional armsquare demo shop with sample printmaking and paper craft supplies.',
        'arts-and-crafts',
        'Madison, Wisconsin',
        'https://picsum.photos/seed/armsquare-craft-shop/1200/900',
        true,
        true
    ),
    (
        'a1000000-0000-4000-8000-000000000003',
        'Switchback Cycle Goods',
        'switchback-cycle-goods-demo',
        'Useful gear for everyday rides',
        'A fictional armsquare demo shop with sample cycling accessories.',
        'cycling',
        'Boulder, Colorado',
        'https://picsum.photos/seed/armsquare-cycle-shop/1200/900',
        true,
        true
    )
on conflict (id) do nothing;

insert into public.business_agents (id, business_id, name, capabilities, enabled_tools)
values
    (
        'a2000000-0000-4000-8000-000000000001',
        'a1000000-0000-4000-8000-000000000001',
        'Clearwater shop assistant',
        array['Answer questions from the published catalog', 'Prepare product listing drafts'],
        array['catalog.read', 'marketplace.search', 'product.create_draft']
    ),
    (
        'a2000000-0000-4000-8000-000000000002',
        'a1000000-0000-4000-8000-000000000002',
        'Sunday Field shop assistant',
        array['Answer questions from the published catalog', 'Prepare product listing drafts'],
        array['catalog.read', 'marketplace.search', 'product.create_draft']
    ),
    (
        'a2000000-0000-4000-8000-000000000003',
        'a1000000-0000-4000-8000-000000000003',
        'Switchback shop assistant',
        array['Answer questions from the published catalog', 'Prepare product listing drafts'],
        array['catalog.read', 'marketplace.search', 'product.create_draft']
    )
on conflict (business_id) do nothing;

insert into public.store_products (
    id, business_id, name, description, price, unit, availability, delivery, image_url, is_published
)
values
    (
        'a3000000-0000-4000-8000-000000000001',
        'a1000000-0000-4000-8000-000000000001',
        'Cedar soap set',
        'Three sample soap bars in a reusable cotton wrap.',
        24.00,
        'set',
        'in_stock',
        'Ships in 2-4 business days',
        'https://picsum.photos/seed/armsquare-soap-set/900/700',
        true
    ),
    (
        'a3000000-0000-4000-8000-000000000002',
        'a1000000-0000-4000-8000-000000000001',
        'Unscented bath bar',
        'A simple sample bath bar for the demo catalog.',
        9.00,
        'bar',
        'made_to_order',
        'Made to order, ships in 5-7 business days',
        'https://picsum.photos/seed/armsquare-bath-bar/900/700',
        true
    ),
    (
        'a3000000-0000-4000-8000-000000000003',
        'a1000000-0000-4000-8000-000000000002',
        'Block printing starter kit',
        'Sample carving blocks, ink, and practice sheets for a first print.',
        38.00,
        'kit',
        'in_stock',
        'Ships in 2-4 business days',
        'https://picsum.photos/seed/armsquare-print-kit/900/700',
        true
    ),
    (
        'a3000000-0000-4000-8000-000000000004',
        'a1000000-0000-4000-8000-000000000002',
        'Cotton rag paper',
        'A sample pack of heavyweight cotton paper for drawing and printmaking.',
        18.00,
        'pack',
        'low_stock',
        'Ships in 2-4 business days',
        'https://picsum.photos/seed/armsquare-rag-paper/900/700',
        true
    ),
    (
        'a3000000-0000-4000-8000-000000000005',
        'a1000000-0000-4000-8000-000000000003',
        'Commuter repair pouch',
        'A small sample saddle pouch with a compact tire lever set.',
        32.00,
        'set',
        'in_stock',
        'Ships in 1-3 business days',
        'https://picsum.photos/seed/armsquare-repair-pouch/900/700',
        true
    ),
    (
        'a3000000-0000-4000-8000-000000000006',
        'a1000000-0000-4000-8000-000000000003',
        'Front light',
        'A sample rechargeable front light for evening rides.',
        46.00,
        'item',
        'made_to_order',
        'Ships in 3-5 business days',
        'https://picsum.photos/seed/armsquare-cycle-light/900/700',
        true
    )
on conflict (id) do nothing;
