-- Reporting view: one row per status change on an input, read from the
-- activity log. Status changes on draft inputs are excluded, so every row
-- joins reporting_inputs.
--
-- Two log formats exist. 'changed_status' stores the [from, to] status ids.
-- Automatic proposal transitions were once logged as 'changed_input_status'
-- with status codes only. Those codes are locked proposal statuses, so the
-- code identifies the status.
WITH changes AS (
    SELECT
        a.id,
        a.item_id AS input_id,
        a.action,
        CASE WHEN a.action = 'changed_status' THEN a.payload -> 'change' ->> 0 END AS from_id,
        CASE WHEN a.action = 'changed_status' THEN a.payload -> 'change' ->> 1 END AS to_id,
        a.payload ->> 'input_status_from_code' AS from_code,
        a.payload ->> 'input_status_to_code' AS to_code,
        a.acted_at
    FROM activities a
    INNER JOIN ideas i ON i.id = a.item_id
    WHERE a.item_type = 'Idea'
        AND a.action IN ('changed_status', 'changed_input_status')
        AND i.publication_status IN ('submitted', 'published')
)
SELECT
    c.id,
    c.input_id,
    from_s.id AS from_status_id,
    COALESCE(
        NULLIF(from_s.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(from_s.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS from_status_label,
    COALESCE(from_s.code, c.from_code) AS from_status_code,
    to_s.id AS to_status_id,
    COALESCE(
        NULLIF(to_s.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(to_s.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS to_status_label,
    COALESCE(to_s.code, c.to_code) AS to_status_code,
    c.acted_at AS changed_at
FROM changes c
LEFT JOIN LATERAL (
    SELECT s.id, s.title_multiloc, s.code
    FROM idea_statuses s
    WHERE (c.action = 'changed_status' AND s.id::text = c.from_id)
        OR (c.action = 'changed_input_status' AND s.participation_method = 'proposals' AND s.code = c.from_code)
    ORDER BY s.ordering
    LIMIT 1
) from_s ON TRUE
LEFT JOIN LATERAL (
    SELECT s.id, s.title_multiloc, s.code
    FROM idea_statuses s
    WHERE (c.action = 'changed_status' AND s.id::text = c.to_id)
        OR (c.action = 'changed_input_status' AND s.participation_method = 'proposals' AND s.code = c.to_code)
    ORDER BY s.ordering
    LIMIT 1
) to_s ON TRUE
