create or replace view public.admin_subscription_overview as
select
  subscriptions.id,
  subscriptions.user_id,
  profiles.full_name,
  profiles.email,
  profiles.approval_status,
  subscriptions.plan_code,
  subscriptions.plan_name,
  subscriptions.plan_price,
  subscriptions.monthly_total,
  subscriptions.starts_at,
  subscriptions.expires_at,
  subscriptions.paid_at,
  subscriptions.status
from public.subscriptions
join public.profiles on profiles.id = subscriptions.user_id;

alter view public.admin_subscription_overview set (security_invoker = true);
