-- Reporting view: one row per phase (a participation step within a project).
--
-- For voting phases, online_voters_count must match the voter count the
-- product shows, or reports built on this view will disagree with it. So it is
-- the product's own count of submitted baskets, not a recount of
-- reporting_contributions: a submitted basket stays counted after every input
-- it picked is deleted. The product never adds offline voters to that count.
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
    ph.baskets_count AS online_voters_count,
    ph.manual_voters_amount,
    ph.manual_voters_last_updated_at
FROM phases ph
