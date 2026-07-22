-- Reporting view: one row per answer an active user gave to an enabled
-- registration question (demographics). Multi-select questions produce one
-- row per selected option.

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
    u.custom_field_values ->> q.key AS answer_value
FROM reporting_users ru
INNER JOIN users u ON u.id = ru.id
INNER JOIN custom_fields q ON q.resource_type = 'User' AND q.enabled
WHERE q.input_type <> 'multiselect'
    AND jsonb_exists(u.custom_field_values, q.key)

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
CROSS JOIN LATERAL jsonb_array_elements_text(u.custom_field_values -> q.key) AS selected(value)
WHERE jsonb_typeof(u.custom_field_values -> q.key) = 'array'
