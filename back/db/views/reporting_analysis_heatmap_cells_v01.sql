-- Reporting view: one row per AutoInsights heatmap cell. A cell crosses two
-- dimensions of one analysis: an analysis tag, or a bin (one answer, or a range
-- of answers) of a registration or form question. It counts the inputs (or
-- likes, dislikes or participants) in both, with a chi-square p-value and the
-- lift over what the totals predict (Analysis::AutoInsightsService).
--
-- Bin labels follow Analysis::HeatmapCellStatementGenerator#bin_to_answer_str,
-- in English: the option title for option bins, the values for value bins, and
-- 'min to max', 'min or more' or 'max or less' for range and age bins.
WITH sides AS (
    SELECT
        'Analysis::Tag' AS type,
        t.id,
        'tag' AS kind,
        t.id AS tag_id,
        t.name AS tag_label,
        NULL::uuid AS question_id,
        NULL::text AS question_label,
        NULL::text AS answer_label
    FROM analysis_tags t

    UNION ALL

    SELECT
        'CustomFieldBin' AS type,
        b.id,
        CASE WHEN q.resource_type = 'User' THEN 'registration_question' ELSE 'form_question' END AS kind,
        NULL::uuid AS tag_id,
        NULL::text AS tag_label,
        q.id AS question_id,
        COALESCE(
            NULLIF(q.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
            (SELECT t.value FROM jsonb_each_text(q.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
        ) AS question_label,
        CASE
            WHEN b.type = 'CustomFieldBins::OptionBin' THEN COALESCE(
                NULLIF(o.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
                (SELECT t.value FROM jsonb_each_text(o.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
            )
            WHEN b.type = 'CustomFieldBins::ValueBin' THEN (
                SELECT string_agg(v.value, ', ') FROM jsonb_array_elements_text(b.values) v
            )
            WHEN lower(b.range) IS NULL THEN upper(b.range) || ' or less'
            WHEN upper(b.range) IS NULL THEN lower(b.range) || ' or more'
            ELSE lower(b.range) || ' to ' || upper(b.range)
        END AS answer_label
    FROM custom_field_bins b
    INNER JOIN custom_fields q ON q.id = b.custom_field_id
    LEFT JOIN custom_field_options o ON o.id = b.custom_field_option_id
)

SELECT
    c.id,
    c.analysis_id,
    -- an analysis has a project or a phase, never both
    COALESCE(a.project_id, ph.project_id) AS project_id,
    a.phase_id,
    c.unit,
    r.kind AS row_kind,
    r.tag_id AS row_tag_id,
    r.tag_label AS row_tag_label,
    r.question_id AS row_question_id,
    r.question_label AS row_question_label,
    r.answer_label AS row_answer_label,
    col.kind AS column_kind,
    col.tag_id AS column_tag_id,
    col.tag_label AS column_tag_label,
    col.question_id AS column_question_id,
    col.question_label AS column_question_label,
    col.answer_label AS column_answer_label,
    c.count,
    c.lift,
    c.p_value,
    c.created_at
FROM analysis_heatmap_cells c
INNER JOIN analysis_analyses a ON a.id = c.analysis_id
LEFT JOIN phases ph ON ph.id = a.phase_id
INNER JOIN sides r ON r.type = c.row_type AND r.id = c.row_id
INNER JOIN sides col ON col.type = c.column_type AND col.id = c.column_id
