-- Reporting view: one row per pageview (a single page displayed to a visitor).
SELECT
    pv.id,
    pv.session_id,
    pv.created_at AS viewed_at,
    pv.path,
    pv.project_id,
    -- second path segment, but only when it is one of the tenant's configured
    -- locales (pageviews for since-removed locales resolve to NULL)
    CASE
        WHEN split_part(pv.path, '/', 2) IN (
            SELECT jsonb_array_elements_text(ac.settings -> 'core' -> 'locales')
            FROM app_configurations ac
        )
        THEN split_part(pv.path, '/', 2)
    END AS locale
FROM impact_tracking_pageviews pv
