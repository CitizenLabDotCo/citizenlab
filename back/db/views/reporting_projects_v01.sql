-- Reporting view: one row per project (participation container).
--
-- Localised text columns resolve a multiloc to the tenant's primary locale
-- (the first entry of core.locales in app_configurations), falling back to
-- the alphabetically-first non-empty translation. Keep this expression
-- identical across all reporting_* views.
SELECT
    p.id,
    COALESCE(
        NULLIF(p.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(p.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS title,
    ap.publication_status,
    phase_bounds.start_at,
    phase_bounds.end_at,
    folder_ap.publication_id AS folder_id,
    p.hidden,
    p.listed
FROM projects p
LEFT JOIN admin_publications ap
    ON ap.publication_id = p.id AND ap.publication_type = 'Project'
LEFT JOIN admin_publications folder_ap
    ON folder_ap.id = ap.parent_id
LEFT JOIN (
    SELECT
        ph.project_id,
        MIN(ph.start_at) AS start_at,
        -- an open-ended phase (NULL end_at) makes the whole project open-ended
        CASE WHEN bool_or(ph.end_at IS NULL) THEN NULL ELSE MAX(ph.end_at) END AS end_at
    FROM phases ph
    GROUP BY ph.project_id
) phase_bounds ON phase_bounds.project_id = p.id
