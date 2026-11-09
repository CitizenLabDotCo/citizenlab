-- Reporting view: one row per AutoInsights heatmap cell. A cell crosses two
-- dimensions of one analysis: an analysis tag, or a bin (one answer, or a range
-- of answers) of a registration or form question. It counts the inputs (or
-- likes, dislikes or participants) in both, with a chi-square p-value and the
-- lift over what the totals predict (Analysis::AutoInsightsService).
--
-- Bin labels follow Analysis::HeatmapCellStatementGenerator#bin_to_answer_str,
-- in English: the option title for option bins, the values for value bins, and
-- 'min to max', 'min or more' or 'max or less' for range and age bins.
--
-- Each side (row, column) joins its tag or bin directly rather than through a
-- shared CTE: a CTE used twice is materialized, which labels every tag and bin
-- in the tenant before a filter on analysis_id can apply. The row and column
-- label expressions are therefore written out twice and must be kept in step.
SELECT
    c.id,
    c.analysis_id,
    -- an analysis has a project or a phase, never both
    COALESCE(a.project_id, ph.project_id) AS project_id,
    a.phase_id,
    c.unit,
    CASE
        WHEN rt.id IS NOT NULL THEN 'tag'
        WHEN rq.resource_type = 'User' THEN 'registration_question'
        ELSE 'form_question'
    END AS row_kind,
    rt.id AS row_tag_id,
    rt.name AS row_tag_label,
    rq.id AS row_question_id,
    COALESCE(
        NULLIF(rq.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(rq.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS row_question_label,
    CASE
        WHEN rb.id IS NULL THEN NULL
        WHEN rb.type = 'CustomFieldBins::OptionBin' THEN COALESCE(
            NULLIF(ro.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
            (SELECT t.value FROM jsonb_each_text(ro.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
        )
        WHEN rb.type = 'CustomFieldBins::ValueBin' THEN (
            SELECT string_agg(v.value, ', ') FROM jsonb_array_elements_text(rb.values) v
        )
        WHEN lower(rb.range) IS NULL THEN upper(rb.range) || ' or less'
        WHEN upper(rb.range) IS NULL THEN lower(rb.range) || ' or more'
        ELSE lower(rb.range) || ' to ' || upper(rb.range)
    END AS row_answer_label,
    CASE
        WHEN ct.id IS NOT NULL THEN 'tag'
        WHEN cq.resource_type = 'User' THEN 'registration_question'
        ELSE 'form_question'
    END AS column_kind,
    ct.id AS column_tag_id,
    ct.name AS column_tag_label,
    cq.id AS column_question_id,
    COALESCE(
        NULLIF(cq.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(cq.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS column_question_label,
    CASE
        WHEN cb.id IS NULL THEN NULL
        WHEN cb.type = 'CustomFieldBins::OptionBin' THEN COALESCE(
            NULLIF(co.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
            (SELECT t.value FROM jsonb_each_text(co.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
        )
        WHEN cb.type = 'CustomFieldBins::ValueBin' THEN (
            SELECT string_agg(v.value, ', ') FROM jsonb_array_elements_text(cb.values) v
        )
        WHEN lower(cb.range) IS NULL THEN upper(cb.range) || ' or less'
        WHEN upper(cb.range) IS NULL THEN lower(cb.range) || ' or more'
        ELSE lower(cb.range) || ' to ' || upper(cb.range)
    END AS column_answer_label,
    c.count,
    c.lift,
    c.p_value,
    c.created_at
FROM analysis_heatmap_cells c
INNER JOIN analysis_analyses a ON a.id = c.analysis_id
LEFT JOIN phases ph ON ph.id = a.phase_id
LEFT JOIN analysis_tags rt ON c.row_type = 'Analysis::Tag' AND rt.id = c.row_id
LEFT JOIN custom_field_bins rb ON c.row_type = 'CustomFieldBin' AND rb.id = c.row_id
LEFT JOIN custom_fields rq ON rq.id = rb.custom_field_id
LEFT JOIN custom_field_options ro ON ro.id = rb.custom_field_option_id
LEFT JOIN analysis_tags ct ON c.column_type = 'Analysis::Tag' AND ct.id = c.column_id
LEFT JOIN custom_field_bins cb ON c.column_type = 'CustomFieldBin' AND cb.id = c.column_id
LEFT JOIN custom_fields cq ON cq.id = cb.custom_field_id
LEFT JOIN custom_field_options co ON co.id = cb.custom_field_option_id
-- Cells have no foreign key to their tag or bin: leave out cells whose tag or
-- bin was deleted.
WHERE (rt.id IS NOT NULL OR rq.id IS NOT NULL)
    AND (ct.id IS NOT NULL OR cq.id IS NOT NULL)
