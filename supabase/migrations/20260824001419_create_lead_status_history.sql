begin;

create table public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null,
  created_at timestamptz not null default now(),
  previous_status text,
  new_status text not null,
  change_source text not null default 'system',
  actor_reference text,
  note text,
  constraint lead_status_history_lead_id_fkey
    foreign key (lead_id)
    references public.leads (id)
    on delete cascade,
  constraint lead_status_history_previous_status_check
    check (
      previous_status is null
      or previous_status in (
        'new',
        'reviewing',
        'sent_to_partner',
        'completed',
        'rejected'
      )
    ),
  constraint lead_status_history_new_status_check
    check (
      new_status in (
        'new',
        'reviewing',
        'sent_to_partner',
        'completed',
        'rejected'
      )
    ),
  constraint lead_status_history_change_source_check
    check (
      change_source in (
        'system',
        'admin',
        'partner',
        'api',
        'migration'
      )
    ),
  constraint lead_status_history_actor_reference_length_check
    check (
      actor_reference is null
      or char_length(actor_reference) <= 200
    ),
  constraint lead_status_history_note_length_check
    check (note is null or char_length(note) <= 1000)
);

create index lead_status_history_lead_created_at_idx
  on public.lead_status_history (lead_id, created_at desc);

create index lead_status_history_new_status_idx
  on public.lead_status_history (new_status);

create function public.record_lead_status_history()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_change_source text;
  v_actor_reference text;
  v_note text;
begin
  if tg_op = 'INSERT' then
    insert into public.lead_status_history (
      lead_id,
      previous_status,
      new_status,
      change_source,
      actor_reference,
      note
    )
    values (
      new.id,
      null,
      new.status,
      'system',
      null,
      null
    );

    return new;
  end if;

  if old.status is not distinct from new.status then
    return new;
  end if;

  v_change_source := coalesce(
    nullif(
      pg_catalog.current_setting(
        'app.lead_status_change_source',
        true
      ),
      ''
    ),
    'system'
  );
  v_actor_reference := nullif(
    pg_catalog.current_setting(
      'app.lead_status_actor_reference',
      true
    ),
    ''
  );
  v_note := nullif(
    pg_catalog.current_setting(
      'app.lead_status_note',
      true
    ),
    ''
  );

  insert into public.lead_status_history (
    lead_id,
    previous_status,
    new_status,
    change_source,
    actor_reference,
    note
  )
  values (
    new.id,
    old.status,
    new.status,
    v_change_source,
    v_actor_reference,
    v_note
  );

  return new;
end;
$$;

create trigger leads_status_history_after_insert
after insert on public.leads
for each row
execute function public.record_lead_status_history();

create trigger leads_status_history_after_status_update
after update of status on public.leads
for each row
when (old.status is distinct from new.status)
execute function public.record_lead_status_history();

create function public.change_lead_status(
  p_lead_id uuid,
  p_new_status text,
  p_change_source text default 'admin',
  p_actor_reference text default null,
  p_note text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_previous_change_source text;
  v_previous_actor_reference text;
  v_previous_note text;
  v_rows_updated integer;
begin
  if p_lead_id is null then
    raise exception using
      errcode = '22004',
      message = 'Lead ID is required.';
  end if;

  if p_new_status is null or p_new_status not in (
    'new',
    'reviewing',
    'sent_to_partner',
    'completed',
    'rejected'
  ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid lead status.';
  end if;

  if p_change_source is null or p_change_source not in (
    'system',
    'admin',
    'partner',
    'api',
    'migration'
  ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid lead status change source.';
  end if;

  if p_actor_reference is not null
    and pg_catalog.char_length(p_actor_reference) > 200 then
    raise exception using
      errcode = '22001',
      message = 'Actor reference must be 200 characters or fewer.';
  end if;

  if p_note is not null
    and pg_catalog.char_length(p_note) > 1000 then
    raise exception using
      errcode = '22001',
      message = 'Lead status note must be 1000 characters or fewer.';
  end if;

  v_previous_change_source := pg_catalog.current_setting(
    'app.lead_status_change_source',
    true
  );
  v_previous_actor_reference := pg_catalog.current_setting(
    'app.lead_status_actor_reference',
    true
  );
  v_previous_note := pg_catalog.current_setting(
    'app.lead_status_note',
    true
  );

  perform pg_catalog.set_config(
    'app.lead_status_change_source',
    p_change_source,
    true
  );
  perform pg_catalog.set_config(
    'app.lead_status_actor_reference',
    coalesce(p_actor_reference, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.lead_status_note',
    coalesce(p_note, ''),
    true
  );

  begin
    update public.leads
    set status = p_new_status
    where id = p_lead_id
      and status is distinct from p_new_status;

    get diagnostics v_rows_updated = row_count;
  exception
    when others then
      perform pg_catalog.set_config(
        'app.lead_status_change_source',
        coalesce(v_previous_change_source, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.lead_status_actor_reference',
        coalesce(v_previous_actor_reference, ''),
        true
      );
      perform pg_catalog.set_config(
        'app.lead_status_note',
        coalesce(v_previous_note, ''),
        true
      );
      raise;
  end;

  perform pg_catalog.set_config(
    'app.lead_status_change_source',
    coalesce(v_previous_change_source, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.lead_status_actor_reference',
    coalesce(v_previous_actor_reference, ''),
    true
  );
  perform pg_catalog.set_config(
    'app.lead_status_note',
    coalesce(v_previous_note, ''),
    true
  );

  return v_rows_updated = 1;
end;
$$;

alter table public.lead_status_history enable row level security;

revoke all privileges on table public.lead_status_history
  from PUBLIC, anon, authenticated;
revoke execute on function public.record_lead_status_history()
  from PUBLIC, anon, authenticated;
revoke execute on function public.change_lead_status(
  uuid,
  text,
  text,
  text,
  text
) from PUBLIC, anon, authenticated;

grant select, insert on table public.lead_status_history to service_role;
grant execute on function public.change_lead_status(
  uuid,
  text,
  text,
  text,
  text
) to service_role;

-- CREATE TRIGGER holds a write-blocking table lock until commit. By creating
-- both lead triggers before this snapshot, concurrent inserts and status
-- updates cannot fall between the backfill and trigger coverage.
insert into public.lead_status_history (
  lead_id,
  previous_status,
  new_status,
  change_source,
  actor_reference,
  note
)
select
  id,
  null,
  status,
  'migration',
  null,
  null
from public.leads;

commit;
