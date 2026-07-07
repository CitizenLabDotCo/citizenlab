-- Reporting view: one row per phase (a participation step within a project).
SELECT
    ph.id,
    ph.project_id,
    COALESCE(
        NULLIF(ph.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(ph.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS title,
    ph.start_at,
    ph.end_at,
    ph.participation_method
FROM phases ph
