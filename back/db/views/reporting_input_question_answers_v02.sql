-- Reporting view: one row per answer to a form question of an input (survey
-- questions and extra idea-form fields), read from custom_field_answers by
-- key. The form is resolved from the input's creation phase, falling back to
-- the project form. Multi-select questions produce one row per selected
-- option. Structurally complex question types (ranking, matrix, mapping,
-- file upload, pages) are not included.

WITH form_inputs AS (
    SELECT
        i.id,
        COALESCE(phase_form.id, project_form.id) AS form_id
    FROM ideas i
    LEFT JOIN custom_forms phase_form
        ON phase_form.participation_context_type = 'Phase'
        AND phase_form.participation_context_id = i.creation_phase_id
    LEFT JOIN custom_forms project_form
        ON project_form.participation_context_type = 'Project'
        AND project_form.participation_context_id = i.project_id
    WHERE i.publication_status IN ('submitted', 'published')
)

-- single-valued questions
SELECT
    i.id AS input_id,
    q.id AS question_id,
    q.key AS question_key,
    q.input_type AS question_type,
    COALESCE(
        NULLIF(q.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(q.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS question_label,
    CASE
        WHEN q.input_type IN ('number', 'linear_scale', 'rating', 'sentiment_linear_scale') THEN NULL
        ELSE a.value #>> '{}'
    END AS value_text,
    CASE
        WHEN q.input_type IN ('number', 'linear_scale', 'rating', 'sentiment_linear_scale')
            AND jsonb_typeof(a.value) = 'number'
        THEN (a.value #>> '{}')::numeric
    END AS value_numeric
FROM form_inputs i
INNER JOIN custom_fields q
    ON q.resource_type = 'CustomForm'
    AND q.resource_id = i.form_id
    AND q.input_type IN (
        'text', 'multiline_text', 'select', 'select_image', 'checkbox', 'date',
        'number', 'linear_scale', 'rating', 'sentiment_linear_scale'
    )
INNER JOIN custom_field_answers a
    ON a.answerable_type = 'Idea'
    AND a.answerable_id = i.id
    AND a.key = q.key

UNION ALL

-- multi-select questions: one row per selected option
SELECT
    i.id AS input_id,
    q.id AS question_id,
    q.key AS question_key,
    q.input_type AS question_type,
    COALESCE(
        NULLIF(q.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(q.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS question_label,
    selected.value AS value_text,
    NULL::numeric AS value_numeric
FROM form_inputs i
INNER JOIN custom_fields q
    ON q.resource_type = 'CustomForm'
    AND q.resource_id = i.form_id
    AND q.input_type IN ('multiselect', 'multiselect_image')
INNER JOIN custom_field_answers a
    ON a.answerable_type = 'Idea'
    AND a.answerable_id = i.id
    AND a.key = q.key
CROSS JOIN LATERAL jsonb_array_elements_text(a.value) AS selected(value)
WHERE jsonb_typeof(a.value) = 'array'
