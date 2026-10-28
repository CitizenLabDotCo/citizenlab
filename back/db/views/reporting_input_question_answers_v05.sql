-- Reporting view: one row per answer to a form question of an input (survey
-- questions and extra idea-form fields), read from custom_field_answers by
-- key. The form is resolved from the input's creation phase, falling back to
-- the project form. Multi-select and ranking questions produce one row per
-- selected or ranked option, matrix questions one row per answered statement.
-- File and shapefile upload answers only record that a file is attached (the
-- stored file name can hold personal data), and only while that file still
-- exists. Point, line and polygon answers carry their GeoJSON geometry in
-- value_geojson. Pages are not included.
--
-- value_label is the text residents saw for the answer: the option title for
-- (multi)select and ranking questions, the point label for linear scales and
-- matrix statements. Option keys are fixed when an option is created, so a key
-- can read very differently from a label that was edited later.
--
-- reporting_community_monitor_scores selects from this view. Postgres won't
-- drop a view that another view depends on, so changing it with update_view
-- (drop and recreate) means dropping and recreating that view around it too;
-- replace_view, which only appends columns, is unaffected.

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
        WHEN q.input_type IN (
            'number', 'linear_scale', 'rating', 'sentiment_linear_scale', 'file_upload',
            'shapefile_upload', 'point', 'line', 'polygon'
        ) THEN NULL
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
    -- Categories must match what the product shows (CustomField#question_category
    -- and the community monitor dashboard), or reports built on this view will
    -- disagree with it. An unset category reads as 'other'.
    CASE
        WHEN i.form_participation_method = 'community_monitor_survey' THEN COALESCE(q.question_category, 'other')
    END AS question_category,
    NULL::text AS statement_key,
    NULL::text AS statement_label,
    CASE
        WHEN q.input_type IN ('point', 'line', 'polygon') THEN a.value
    END AS value_geojson
FROM form_inputs i
INNER JOIN custom_fields q
    ON q.resource_type = 'CustomForm'
    AND q.resource_id = i.form_id
    AND q.input_type IN (
        'text', 'multiline_text', 'select', 'select_image', 'checkbox', 'date',
        'number', 'linear_scale', 'rating', 'sentiment_linear_scale', 'file_upload',
        'shapefile_upload', 'point', 'line', 'polygon'
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
        -- Needs one WHEN per point a scale allows (CustomField::LINEAR_SCALE_MAX_RANGE),
        -- or the extra points get no label. The matrix lookup below needs the same.
        WHEN q.input_type IN ('linear_scale', 'sentiment_linear_scale') AND jsonb_typeof(a.value) = 'number'
        THEN CASE a.value #>> '{}'
            WHEN '1' THEN q.linear_scale_label_1_multiloc
            WHEN '2' THEN q.linear_scale_label_2_multiloc
            WHEN '3' THEN q.linear_scale_label_3_multiloc
            WHEN '4' THEN q.linear_scale_label_4_multiloc
            WHEN '5' THEN q.linear_scale_label_5_multiloc
            WHEN '6' THEN q.linear_scale_label_6_multiloc
            WHEN '7' THEN q.linear_scale_label_7_multiloc
            WHEN '8' THEN q.linear_scale_label_8_multiloc
            WHEN '9' THEN q.linear_scale_label_9_multiloc
            WHEN '10' THEN q.linear_scale_label_10_multiloc
            WHEN '11' THEN q.linear_scale_label_11_multiloc
        END
    END AS multiloc
) label
-- File and shapefile upload answers must count the files the survey results
-- page counts (Surveys::ResultsGenerator#visit_file_upload, which shapefile
-- uploads also use): deleting a file leaves its answer behind, so only keep
-- answers whose file still exists. The id is cast only when it is a UUID, since
-- the API accepts any string there.
WHERE q.input_type NOT IN ('file_upload', 'shapefile_upload')
    OR EXISTS (
        SELECT 1 FROM file_attachments fa
        WHERE fa.id = CASE
            WHEN a.value ->> 'id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN (a.value ->> 'id')::uuid
        END
    )
    OR EXISTS (
        SELECT 1 FROM idea_files f
        WHERE f.id = CASE
            WHEN a.value ->> 'id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN (a.value ->> 'id')::uuid
        END
    )

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
    END AS question_category,
    NULL::text AS statement_key,
    NULL::text AS statement_label,
    NULL::jsonb AS value_geojson
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

UNION ALL

-- ranking questions: one row per ranked option, value_numeric is its rank
-- (1 = ranked first). Average ranks must match the survey results page
-- (CustomField#average_rankings), or reports built on this view will disagree
-- with it.
SELECT
    i.id AS input_id,
    q.id AS question_id,
    q.key AS question_key,
    q.input_type AS question_type,
    COALESCE(
        NULLIF(q.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(q.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS question_label,
    ranked.value AS value_text,
    ranked.rank::numeric AS value_numeric,
    COALESCE(
        NULLIF(o.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(o.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS value_label,
    CASE
        WHEN i.form_participation_method = 'community_monitor_survey' THEN COALESCE(q.question_category, 'other')
    END AS question_category,
    NULL::text AS statement_key,
    NULL::text AS statement_label,
    NULL::jsonb AS value_geojson
FROM form_inputs i
INNER JOIN custom_fields q
    ON q.resource_type = 'CustomForm'
    AND q.resource_id = i.form_id
    AND q.input_type = 'ranking'
INNER JOIN custom_field_answers a
    ON a.answerable_type = 'Idea'
    AND a.answerable_id = i.id
    AND a.key = q.key
CROSS JOIN LATERAL jsonb_array_elements_text(a.value) WITH ORDINALITY AS ranked(value, rank)
LEFT JOIN custom_field_options o
    ON o.custom_field_id = q.id
    AND o.key = ranked.value
WHERE jsonb_typeof(a.value) = 'array'

UNION ALL

-- matrix questions: one row per answered statement, value_numeric is the
-- chosen point on the shared scale. Counts must match the survey results page
-- (Surveys::ResultsGenerator), or reports built on this view will disagree with
-- it: like that page, only count the question's current statements and
-- whole-number points from 1 to its maximum. Points are compared as JSON
-- values, as that page groups them, so 3.0 counts as 3 and 2.5 not at all.
SELECT
    i.id AS input_id,
    q.id AS question_id,
    q.key AS question_key,
    q.input_type AS question_type,
    COALESCE(
        NULLIF(q.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(q.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS question_label,
    NULL AS value_text,
    -- Guarded because Postgres can push an outer filter on value_numeric into
    -- this branch ahead of the WHERE, and one non-numeric answer would then
    -- fail the whole query.
    CASE WHEN jsonb_typeof(answered.value) = 'number' THEN (answered.value #>> '{}')::numeric END AS value_numeric,
    COALESCE(
        NULLIF(label.multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(label.multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS value_label,
    CASE
        WHEN i.form_participation_method = 'community_monitor_survey' THEN COALESCE(q.question_category, 'other')
    END AS question_category,
    answered.key AS statement_key,
    COALESCE(
        NULLIF(s.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(s.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS statement_label,
    NULL::jsonb AS value_geojson
FROM form_inputs i
INNER JOIN custom_fields q
    ON q.resource_type = 'CustomForm'
    AND q.resource_id = i.form_id
    AND q.input_type = 'matrix_linear_scale'
INNER JOIN custom_field_answers a
    ON a.answerable_type = 'Idea'
    AND a.answerable_id = i.id
    AND a.key = q.key
CROSS JOIN LATERAL jsonb_each(a.value) AS answered(key, value)
INNER JOIN custom_field_matrix_statements s
    ON s.custom_field_id = q.id
    AND s.key = answered.key
-- Needs one WHEN per point a scale allows, like the linear scale lookup above.
CROSS JOIN LATERAL (
    SELECT CASE answered.value
        WHEN '1' THEN q.linear_scale_label_1_multiloc
        WHEN '2' THEN q.linear_scale_label_2_multiloc
        WHEN '3' THEN q.linear_scale_label_3_multiloc
        WHEN '4' THEN q.linear_scale_label_4_multiloc
        WHEN '5' THEN q.linear_scale_label_5_multiloc
        WHEN '6' THEN q.linear_scale_label_6_multiloc
        WHEN '7' THEN q.linear_scale_label_7_multiloc
        WHEN '8' THEN q.linear_scale_label_8_multiloc
        WHEN '9' THEN q.linear_scale_label_9_multiloc
        WHEN '10' THEN q.linear_scale_label_10_multiloc
        WHEN '11' THEN q.linear_scale_label_11_multiloc
    END AS multiloc
) label
WHERE jsonb_typeof(a.value) = 'object'
    AND answered.value IN (SELECT to_jsonb(generate_series(1, q.maximum)))
