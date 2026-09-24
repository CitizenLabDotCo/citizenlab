-- Reporting view: one row per answer an active user gave to an enabled
-- registration question (demographics), read from custom_field_answers by
-- key. Multi-select questions produce one row per selected option.

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
    a.value #>> '{}' AS answer_value
FROM reporting_users ru
INNER JOIN users u ON u.id = ru.id
INNER JOIN custom_fields q ON q.resource_type = 'User' AND q.enabled
INNER JOIN custom_field_answers a
    ON a.answerable_type = 'User'
    AND a.answerable_id = u.id
    AND a.key = q.key
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
    selected.value AS answer_value
FROM reporting_users ru
INNER JOIN users u ON u.id = ru.id
INNER JOIN custom_fields q ON q.resource_type = 'User' AND q.enabled AND q.input_type = 'multiselect'
INNER JOIN custom_field_answers a
    ON a.answerable_type = 'User'
    AND a.answerable_id = u.id
    AND a.key = q.key
CROSS JOIN LATERAL jsonb_array_elements_text(a.value) AS selected(value)
WHERE jsonb_typeof(a.value) = 'array'
