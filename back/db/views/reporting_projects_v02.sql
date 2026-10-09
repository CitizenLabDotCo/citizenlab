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
    p.title_multiloc,
    ap.publication_status,
    phase_bounds.start_at,
    phase_bounds.end_at,
    folder_ap.publication_id AS folder_id,
    p.hidden,
    p.listed,
    p.visible_to,
    ap.first_published_at,
    p.created_at,
    COALESCE(
        NULLIF(f.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(f.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS folder_title,
    ARRAY(
        SELECT COALESCE(
            NULLIF(gt.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
            (SELECT t.value FROM jsonb_each_text(gt.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
        )
        FROM global_topics gt
        WHERE EXISTS (SELECT 1 FROM projects_global_topics pgt WHERE pgt.project_id = p.id AND pgt.global_topic_id = gt.id)
        ORDER BY gt.ordering
    ) AS topics,
    -- A project marked "all areas" matches every area, as in the product's
    -- project filters.
    ARRAY(
        SELECT COALESCE(
            NULLIF(a.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
            (SELECT t.value FROM jsonb_each_text(a.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
        )
        FROM areas a
        WHERE p.include_all_areas
            OR EXISTS (SELECT 1 FROM areas_projects ap2 WHERE ap2.project_id = p.id AND ap2.area_id = a.id)
        ORDER BY a.ordering
    ) AS areas,
    ARRAY(
        SELECT methods.participation_method
        FROM (
            SELECT ph.participation_method, MIN(ph.start_at) AS first_start_at
            FROM phases ph
            WHERE ph.project_id = p.id
            GROUP BY ph.participation_method
        ) methods
        ORDER BY methods.first_start_at, methods.participation_method
    )::text[] AS participation_methods
FROM projects p
LEFT JOIN admin_publications ap
    ON ap.publication_id = p.id AND ap.publication_type = 'Project'
LEFT JOIN admin_publications folder_ap
    ON folder_ap.id = ap.parent_id
LEFT JOIN project_folders_folders f
    ON f.id = folder_ap.publication_id
LEFT JOIN (
    SELECT
        ph.project_id,
        MIN(ph.start_at) AS start_at,
        -- an open-ended phase (NULL end_at) makes the whole project open-ended
        CASE WHEN bool_or(ph.end_at IS NULL) THEN NULL ELSE MAX(ph.end_at) END AS end_at
    FROM phases ph
    GROUP BY ph.project_id
) phase_bounds ON phase_bounds.project_id = p.id
