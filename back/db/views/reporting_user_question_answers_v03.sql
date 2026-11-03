-- Reporting view: one row per answer an active user gave to an enabled
-- registration question (demographics), read from custom_field_answers by
-- key. Multi-select questions produce one row per selected option.
--
-- answer_label is the text users saw for the answer: the option title for
-- (multi)select questions. Domicile answers store an area id (or 'outside')
-- rather than an option key, so their label comes from the area, or from the
-- one domicile option that has no area.

-- single-valued questions
SELECT
    u.id AS user_id,
    q.id AS question_id,
    q.key AS question_key,
    q.input_type AS question_type,
    COALESCE(
        NULLIF(q.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(q.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS question_label,
    a.value #>> '{}' AS answer_value,
    COALESCE(
        NULLIF(label.multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(label.multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS answer_label
FROM reporting_users ru
INNER JOIN users u ON u.id = ru.id
INNER JOIN custom_fields q ON q.resource_type = 'User' AND q.enabled
INNER JOIN custom_field_answers a
    ON a.answerable_type = 'User'
    AND a.answerable_id = u.id
    AND a.key = q.key
CROSS JOIN LATERAL (
    SELECT CASE
        WHEN q.key = 'domicile' AND a.value #>> '{}' = 'outside' THEN (
            SELECT o.title_multiloc FROM custom_field_options o
            WHERE o.custom_field_id = q.id
                AND NOT EXISTS (SELECT 1 FROM areas ar WHERE ar.custom_field_option_id = o.id)
            ORDER BY o.ordering
            LIMIT 1
        )
        WHEN q.key = 'domicile' THEN (
            SELECT ar.title_multiloc FROM areas ar WHERE ar.id::text = a.value #>> '{}'
        )
        WHEN q.input_type = 'select' THEN (
            SELECT o.title_multiloc FROM custom_field_options o
            WHERE o.custom_field_id = q.id AND o.key = a.value #>> '{}'
        )
    END AS multiloc
) label
WHERE q.input_type <> 'multiselect'

UNION ALL

-- multi-select questions: one row per selected option
SELECT
    u.id AS user_id,
    q.id AS question_id,
    q.key AS question_key,
    q.input_type AS question_type,
    COALESCE(
        NULLIF(q.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(q.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS question_label,
    selected.value AS answer_value,
    COALESCE(
        NULLIF(o.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(o.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS answer_label
FROM reporting_users ru
INNER JOIN users u ON u.id = ru.id
INNER JOIN custom_fields q ON q.resource_type = 'User' AND q.enabled AND q.input_type = 'multiselect'
INNER JOIN custom_field_answers a
    ON a.answerable_type = 'User'
    AND a.answerable_id = u.id
    AND a.key = q.key
CROSS JOIN LATERAL jsonb_array_elements_text(a.value) AS selected(value)
LEFT JOIN custom_field_options o
    ON o.custom_field_id = q.id
    AND o.key = selected.value
WHERE jsonb_typeof(a.value) = 'array'
