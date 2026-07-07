-- Reporting view: the current status of each input that has one. Statuses
-- denote where an input stands in the participation process and are managed
-- by administrators.
SELECT
    i.id AS input_id,
    s.id AS status_id,
    COALESCE(
        NULLIF(s.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(s.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS status_label,
    s.code AS status_code
FROM ideas i
INNER JOIN idea_statuses s ON s.id = i.idea_status_id
WHERE i.publication_status IN ('submitted', 'published')
