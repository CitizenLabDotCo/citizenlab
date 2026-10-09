-- Reporting view: the population base data behind the representativeness
-- dashboard, one row per option or age group of each enabled registration
-- question's current distribution (its latest upload, as
-- CustomField#current_ref_distribution). Disabled questions are left out, as
-- on the dashboard and in reporting_user_question_answers, since no user
-- answers could be compared with them.
--
-- Categorical distributions map option ids to counts. answer_value and
-- answer_label match reporting_user_question_answers, so rows join on
-- question_id + answer_value; for domicile that means the area id (or
-- 'outside' for the option without an area), not the option key.
-- Binned distributions (birthyear only) hold age boundaries: bins has one more
-- element than counts, and only the first and last can be open-ended.
WITH current_distributions AS (
    SELECT DISTINCT ON (rd.custom_field_id)
        rd.id,
        rd.custom_field_id,
        rd.type,
        rd.distribution,
        rd.updated_at
    FROM user_custom_fields_representativeness_ref_distributions rd
    ORDER BY rd.custom_field_id, rd.created_at DESC
)

SELECT
    d.id || ':' || o.id AS id,
    q.id AS question_id,
    q.key AS question_key,
    CASE
        WHEN q.key = 'domicile' THEN COALESCE(ar.id::text, 'outside')
        ELSE o.key
    END AS answer_value,
    COALESCE(
        NULLIF(COALESCE(ar.title_multiloc, o.title_multiloc) ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(COALESCE(ar.title_multiloc, o.title_multiloc)) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS answer_label,
    NULL::integer AS min_age,
    NULL::integer AS max_age,
    counts.value::integer AS population_count,
    d.updated_at
FROM current_distributions d
INNER JOIN custom_fields q ON q.id = d.custom_field_id AND q.enabled
CROSS JOIN LATERAL jsonb_each_text(d.distribution) AS counts(option_id, value)
INNER JOIN custom_field_options o ON o.id::text = counts.option_id
LEFT JOIN areas ar ON q.key = 'domicile' AND ar.custom_field_option_id = o.id
WHERE d.type = 'UserCustomFields::Representativeness::CategoricalDistribution'

UNION ALL

SELECT
    d.id || ':' || (bin.idx - 1) AS id,
    q.id AS question_id,
    q.key AS question_key,
    NULL AS answer_value,
    NULL AS answer_label,
    COALESCE((d.distribution -> 'bins' ->> (bin.idx - 1)::integer)::integer, 0) AS min_age,
    (d.distribution -> 'bins' ->> bin.idx::integer)::integer AS max_age,
    bin.count::integer AS population_count,
    d.updated_at
FROM current_distributions d
INNER JOIN custom_fields q ON q.id = d.custom_field_id AND q.enabled
CROSS JOIN LATERAL jsonb_array_elements_text(d.distribution -> 'counts') WITH ORDINALITY AS bin(count, idx)
WHERE d.type = 'UserCustomFields::Representativeness::BinnedDistribution'
