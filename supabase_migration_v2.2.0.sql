-- ============================================================
-- Health Hub v2.2.0 - Migration SQL  (Samsung body-comp sync + freshness)
-- הרץ ב-Supabase SQL Editor (New Query -> Paste -> Run). בטוח להריץ שוב (idempotent).
-- לא הורס נתונים: רק מוסיף עמודות + triggers.
-- ============================================================

-- ---------- 0. פונקציית עזר: עדכון updated_at בכל UPDATE ----------
-- חשוב: ב-Postgres `default now()` נדלק רק ב-INSERT, לא ב-UPDATE/upsert.
-- בלי זה, סנכרון חוזר מעדכן ערכים אבל updated_at "קופא" -> נראה כאילו לא התרענן.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------- 1. health_daily (פעילות: צעדים/ק"מ/קלוריות) ----------
-- ודא שקיימת עמודת updated_at, וחבר trigger שמעדכן אותה בכל upsert.
alter table public.health_daily
  add column if not exists updated_at timestamptz default now();

drop trigger if exists trg_health_daily_updated on public.health_daily;
create trigger trg_health_daily_updated
  before update on public.health_daily
  for each row execute function public.set_updated_at();

-- ---------- 2. body_metrics (הרכב גוף: משקל/שומן/שריר) ----------
-- מקור הנתון: 'manual' (מודאל ⚖️ / צילום מסך) או 'samsung' (סנכרון אוטומטי מ-Health Connect).
-- שני המקורות חיים זה לצד זה ונשמרים באותה היסטוריה -> רצף נתונים נשמר.
alter table public.body_metrics
  add column if not exists source text not null default 'manual';

alter table public.body_metrics
  add column if not exists updated_at timestamptz default now();

drop trigger if exists trg_body_metrics_updated on public.body_metrics;
create trigger trg_body_metrics_updated
  before update on public.body_metrics
  for each row execute function public.set_updated_at();

-- הרשאות anon לעמודות החדשות מכוסות ע"י הענקת ALL/columns הקיימת על הטבלה.
-- (אם הוגדרו הרשאות ברמת-עמודה ספציפיות בעבר - הוסף ידנית select/insert/update על source, updated_at.)

-- ---------- 3. אישור ----------
select
  (select count(*) from public.health_daily) as health_daily_rows,
  (select count(*) from public.body_metrics) as body_metrics_rows,
  (select count(*) from public.body_metrics where source = 'samsung') as samsung_metric_rows;
