-- Reporting view: one row per browser session (bot traffic is filtered out at
-- ingestion time, before a session row is created).
SELECT
    s.id,
    s.created_at AS started_at,
    s.user_id,
    s.monthly_user_hash AS anonymous_id,
    COALESCE(s.user_id::text, s.monthly_user_hash) AS visitor_id,
    s.highest_role,
    s.device_type AS device,
    s.referrer
FROM impact_tracking_sessions s
