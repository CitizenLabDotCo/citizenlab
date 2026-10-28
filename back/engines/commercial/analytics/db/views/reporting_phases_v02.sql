-- Reporting view: one row per phase (a participation step within a project).
--
-- For voting phases, online_voters_count must match the voter count the
-- product shows, or reports built on this view will disagree with it. So it is
-- the product's own count of submitted baskets, not a recount of
-- reporting_contributions: a submitted basket stays counted after every input
-- it picked is deleted. The product never adds offline voters to that count.
--
-- The visitor counts must likewise match the phase insights
-- (Insights::VisitsService for the phase's project and dates): visitors with a
-- pageview of the project from start_at up to, not including, end_at. Staff
-- are left out the way the insights' toggle does it, by the session's
-- highest_role. They are two scalar subqueries, not one lateral join, so a
-- query that doesn't select them doesn't pay for them.
SELECT
    ph.id,
    ph.project_id,
    COALESCE(
        NULLIF(ph.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(ph.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS title,
    ph.title_multiloc,
    ph.start_at,
    ph.end_at,
    ph.participation_method,
    ph.created_at,
    -- The phase keeps these values when it stops being a voting phase.
    CASE WHEN ph.participation_method = 'voting' THEN ph.baskets_count ELSE 0 END AS online_voters_count,
    CASE WHEN ph.participation_method = 'voting' THEN COALESCE(ph.manual_voters_amount, 0) ELSE 0 END AS offline_voters_count,
    CASE WHEN ph.participation_method = 'voting' THEN ph.manual_voters_last_updated_at END AS offline_voters_updated_at,
    (
        SELECT COUNT(DISTINCT COALESCE(s.user_id::text, s.monthly_user_hash))
        FROM impact_tracking_pageviews pv
        JOIN impact_tracking_sessions s ON s.id = pv.session_id
        WHERE pv.project_id = ph.project_id
          AND pv.created_at >= ph.start_at
          AND (ph.end_at IS NULL OR pv.created_at < ph.end_at)
    ) AS visitors_count,
    (
        SELECT COUNT(DISTINCT COALESCE(s.user_id::text, s.monthly_user_hash))
        FROM impact_tracking_pageviews pv
        JOIN impact_tracking_sessions s ON s.id = pv.session_id
        WHERE pv.project_id = ph.project_id
          AND pv.created_at >= ph.start_at
          AND (ph.end_at IS NULL OR pv.created_at < ph.end_at)
          AND (s.highest_role IS NULL OR s.highest_role = 'user')
    ) AS non_staff_visitors_count
FROM phases ph
