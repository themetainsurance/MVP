begin;

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  title text not null,
  slug text not null,
  excerpt text,
  category text not null default 'general',
  body_markdown text not null default '',
  status text not null default 'draft',
  author_name text,
  seo_title text,
  meta_description text,
  featured_image_path text,
  featured_image_alt text,
  first_published_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  constraint blog_posts_created_by_fkey
    foreign key (created_by)
    references auth.users (id)
    on delete set null,
  constraint blog_posts_updated_by_fkey
    foreign key (updated_by)
    references auth.users (id)
    on delete set null,
  constraint blog_posts_title_check
    check (
      char_length(btrim(title)) > 0
      and char_length(title) <= 180
    ),
  constraint blog_posts_slug_key unique (slug),
  constraint blog_posts_slug_check
    check (
      char_length(slug) between 3 and 160
      and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
  constraint blog_posts_legacy_slug_check
    check (
      slug not in (
        'how-to-compare-insurance-policies',
        'insurance-renewal-checklist',
        'motor-insurance-guide',
        'property-insurance-guide',
        'travel-insurance-guide'
      )
    ),
  constraint blog_posts_excerpt_check
    check (excerpt is null or char_length(excerpt) <= 320),
  constraint blog_posts_category_check
    check (category in ('travel', 'motor', 'property', 'general')),
  constraint blog_posts_body_markdown_check
    check (char_length(body_markdown) <= 200000),
  constraint blog_posts_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint blog_posts_author_name_check
    check (
      author_name is null
      or (
        char_length(btrim(author_name)) > 0
        and char_length(author_name) <= 120
      )
    ),
  constraint blog_posts_seo_title_check
    check (
      seo_title is null
      or (
        char_length(btrim(seo_title)) > 0
        and char_length(seo_title) <= 70
      )
    ),
  constraint blog_posts_meta_description_check
    check (
      meta_description is null
      or (
        char_length(btrim(meta_description)) > 0
        and char_length(meta_description) <= 180
      )
    ),
  constraint blog_posts_featured_image_path_check
    check (
      featured_image_path is null
      or (
        char_length(featured_image_path) <= 500
        and featured_image_path like 'posts/' || id::text || '/%'
        and featured_image_path ~ '^posts/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$'
      )
    ),
  constraint blog_posts_featured_image_alt_check
    check (
      featured_image_alt is null
      or (
        char_length(btrim(featured_image_alt)) > 0
        and char_length(featured_image_alt) <= 300
      )
    ),
  constraint blog_posts_featured_image_accessibility_check
    check (
      featured_image_path is null
      or (
        featured_image_alt is not null
        and char_length(btrim(featured_image_alt)) > 0
      )
    )
);

create table public.blog_post_revisions (
  id uuid primary key default gen_random_uuid(),
  blog_post_id uuid not null,
  created_at timestamptz not null default now(),
  changed_by uuid,
  change_type text not null,
  title text not null,
  slug text not null,
  excerpt text,
  category text not null,
  body_markdown text not null,
  status text not null,
  author_name text,
  seo_title text,
  meta_description text,
  featured_image_path text,
  featured_image_alt text,
  first_published_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  constraint blog_post_revisions_blog_post_id_fkey
    foreign key (blog_post_id)
    references public.blog_posts (id)
    on delete restrict,
  constraint blog_post_revisions_changed_by_fkey
    foreign key (changed_by)
    references auth.users (id)
    on delete set null,
  constraint blog_post_revisions_change_type_check
    check (
      change_type in (
        'content_update',
        'seo_update',
        'media_update',
        'status_change',
        'mixed_update'
      )
    )
);

create index blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create index blog_posts_category_status_published_at_idx
  on public.blog_posts (category, status, published_at desc);

create index blog_posts_updated_at_idx
  on public.blog_posts (updated_at desc);

create index blog_posts_created_by_idx
  on public.blog_posts (created_by)
  where created_by is not null;

create index blog_posts_updated_by_idx
  on public.blog_posts (updated_by)
  where updated_by is not null;

create index blog_post_revisions_post_created_at_idx
  on public.blog_post_revisions (blog_post_id, created_at desc);

create index blog_post_revisions_changed_by_idx
  on public.blog_post_revisions (changed_by)
  where changed_by is not null;

create function public.enforce_blog_post_lifecycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'A new blog post must begin as a draft.';
    end if;

    new.first_published_at = null;
    new.published_at = null;
    new.archived_at = null;
    return new;
  end if;

  if old.first_published_at is not null and new.slug is distinct from old.slug then
    raise exception 'A previously published blog slug cannot be changed.';
  end if;

  new.created_at = old.created_at;
  new.created_by = old.created_by;
  new.first_published_at = old.first_published_at;
  new.published_at = old.published_at;
  new.archived_at = old.archived_at;

  if new.status is distinct from old.status then
    if old.status = 'draft' and new.status not in ('published', 'archived') then
      raise exception 'Invalid blog status transition.';
    elsif old.status = 'published' and new.status <> 'archived' then
      raise exception 'Published blog posts may only be archived.';
    elsif old.status = 'archived' and new.status = 'draft'
      and old.first_published_at is not null then
      raise exception 'A previously published blog post cannot return to draft.';
    elsif old.status = 'archived' and new.status not in ('published', 'draft') then
      raise exception 'Invalid blog status transition.';
    end if;

    if new.status = 'published' then
      if new.first_published_at is null then
        new.first_published_at = now();
      end if;
      new.published_at = now();
      new.archived_at = null;
    elsif new.status = 'archived' then
      new.archived_at = now();
    elsif new.status = 'draft' then
      new.archived_at = null;
    end if;
  end if;

  if new.status = 'published' and (
    char_length(btrim(new.title)) = 0
    or char_length(btrim(new.slug)) = 0
    or char_length(btrim(new.body_markdown)) = 0
    or new.meta_description is null
    or char_length(btrim(new.meta_description)) = 0
  ) then
    raise exception 'Published blog posts require complete content and metadata.';
  end if;

  return new;
end;
$$;

create function public.record_blog_post_revision()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  content_changed boolean;
  seo_changed boolean;
  media_changed boolean;
  status_changed boolean;
  changed_groups integer;
  revision_type text;
begin
  content_changed = row(
    new.title,
    new.slug,
    new.excerpt,
    new.category,
    new.body_markdown,
    new.author_name
  ) is distinct from row(
    old.title,
    old.slug,
    old.excerpt,
    old.category,
    old.body_markdown,
    old.author_name
  );

  seo_changed = row(
    new.seo_title,
    new.meta_description
  ) is distinct from row(
    old.seo_title,
    old.meta_description
  );

  media_changed = row(
    new.featured_image_path,
    new.featured_image_alt
  ) is distinct from row(
    old.featured_image_path,
    old.featured_image_alt
  );

  status_changed = row(
    new.status,
    new.first_published_at,
    new.published_at,
    new.archived_at
  ) is distinct from row(
    old.status,
    old.first_published_at,
    old.published_at,
    old.archived_at
  );

  changed_groups = content_changed::integer
    + seo_changed::integer
    + media_changed::integer
    + status_changed::integer;

  if changed_groups = 0 then
    return new;
  elsif changed_groups > 1 then
    revision_type = 'mixed_update';
  elsif content_changed then
    revision_type = 'content_update';
  elsif seo_changed then
    revision_type = 'seo_update';
  elsif media_changed then
    revision_type = 'media_update';
  else
    revision_type = 'status_change';
  end if;

  insert into public.blog_post_revisions (
    blog_post_id,
    changed_by,
    change_type,
    title,
    slug,
    excerpt,
    category,
    body_markdown,
    status,
    author_name,
    seo_title,
    meta_description,
    featured_image_path,
    featured_image_alt,
    first_published_at,
    published_at,
    archived_at
  ) values (
    old.id,
    new.updated_by,
    revision_type,
    old.title,
    old.slug,
    old.excerpt,
    old.category,
    old.body_markdown,
    old.status,
    old.author_name,
    old.seo_title,
    old.meta_description,
    old.featured_image_path,
    old.featured_image_alt,
    old.first_published_at,
    old.published_at,
    old.archived_at
  );

  return new;
end;
$$;

create function public.set_blog_post_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if row(
    new.title,
    new.slug,
    new.excerpt,
    new.category,
    new.body_markdown,
    new.status,
    new.author_name,
    new.seo_title,
    new.meta_description,
    new.featured_image_path,
    new.featured_image_alt,
    new.first_published_at,
    new.published_at,
    new.archived_at
  ) is distinct from row(
    old.title,
    old.slug,
    old.excerpt,
    old.category,
    old.body_markdown,
    old.status,
    old.author_name,
    old.seo_title,
    old.meta_description,
    old.featured_image_path,
    old.featured_image_alt,
    old.first_published_at,
    old.published_at,
    old.archived_at
  ) then
    new.updated_at = now();
  else
    new.updated_at = old.updated_at;
    new.updated_by = old.updated_by;
  end if;

  return new;
end;
$$;

create function public.prevent_blog_post_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'Blog posts cannot be hard-deleted; archive the post instead.';
end;
$$;

create trigger blog_posts_10_enforce_lifecycle
before insert or update on public.blog_posts
for each row
execute function public.enforce_blog_post_lifecycle();

create trigger blog_posts_20_record_revision
before update on public.blog_posts
for each row
execute function public.record_blog_post_revision();

create trigger blog_posts_90_set_updated_at
before update on public.blog_posts
for each row
execute function public.set_blog_post_updated_at();

create trigger blog_posts_prevent_delete
before delete on public.blog_posts
for each row
execute function public.prevent_blog_post_delete();

alter table public.blog_posts enable row level security;
alter table public.blog_post_revisions enable row level security;

revoke all privileges on table public.blog_posts
  from PUBLIC, anon, authenticated, service_role;
revoke all privileges on table public.blog_post_revisions
  from PUBLIC, anon, authenticated, service_role;

grant select, insert, update on table public.blog_posts
  to service_role;
grant select, insert on table public.blog_post_revisions
  to service_role;

revoke execute on function public.enforce_blog_post_lifecycle()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.record_blog_post_revision()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.set_blog_post_updated_at()
  from PUBLIC, anon, authenticated, service_role;
revoke execute on function public.prevent_blog_post_delete()
  from PUBLIC, anon, authenticated, service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
);

-- Public buckets make reads public, but writes still require Storage RLS.
-- No upload, update, or delete policy is created for browser roles. Trusted
-- server-side service-role code is the only application upload path.

comment on table public.blog_posts is
  'Server-managed blog CMS content. Published posts are archived rather than deleted.';

comment on table public.blog_post_revisions is
  'Read-only audit snapshots containing the previous version of a blog post.';

commit;
