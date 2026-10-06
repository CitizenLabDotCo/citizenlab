-- Reporting view: one row per answer to a form question of an input (survey
-- questions and extra idea-form fields), read from custom_field_answers by
-- key. The form is resolved from the input's creation phase, falling back to
-- the project form. Multi-select questions produce one row per selected
-- option. Structurally complex question types (ranking, matrix, mapping,
-- file upload, pages) are not included.
--
-- value_label is the text residents saw for the answer: the option title for
-- (multi)select questions, the point label for linear scales. Option keys are
-- fixed when an option is created, so a key can read very differently from a
-- label that was edited later.

WITH form_inputs AS (
    SELECT
        i.id,
        COALESCE(phase_form.id, project_form.id) AS form_id,
        form_ph.participation_method AS form_participation_method
    FROM ideas i
    LEFT JOIN custom_forms phase_form
        ON phase_form.participation_context_type = 'Phase'
        AND phase_form.participation_context_id = i.creation_phase_id
    LEFT JOIN custom_forms project_form
        ON project_form.participation_context_type = 'Project'
        AND project_form.participation_context_id = i.project_id
    LEFT JOIN phases form_ph
        ON phase_form.id IS NOT NULL
        AND form_ph.id = i.creation_phase_id
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
    END AS value_numeric,
    COALESCE(
        NULLIF(label.multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(label.multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS value_label,
    -- Mirrors CustomField#question_category: only community monitor questions
    -- are categorised, and an unset category there means 'other'.
    CASE
        WHEN i.form_participation_method = 'community_monitor_survey' THEN COALESCE(q.question_category, 'other')
    END AS question_category
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
CROSS JOIN LATERAL (
    SELECT CASE
        WHEN q.input_type IN ('select', 'select_image') THEN (
            SELECT o.title_multiloc FROM custom_field_options o
            WHERE o.custom_field_id = q.id AND o.key = a.value #>> '{}'
        )
        WHEN q.input_type IN ('linear_scale', 'sentiment_linear_scale') AND jsonb_typeof(a.value) = 'number'
        THEN to_jsonb(q) -> ('linear_scale_label_' || (a.value #>> '{}') || '_multiloc')
    END AS multiloc
) label

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
    NULL::numeric AS value_numeric,
    COALESCE(
        NULLIF(o.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(o.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS value_label,
    CASE
        WHEN i.form_participation_method = 'community_monitor_survey' THEN COALESCE(q.question_category, 'other')
    END AS question_category
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
LEFT JOIN custom_field_options o
    ON o.custom_field_id = q.id
    AND o.key = selected.value
WHERE jsonb_typeof(a.value) = 'array'
