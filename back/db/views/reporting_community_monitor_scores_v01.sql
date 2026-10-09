-- Reporting view: community monitor scores, one row per phase, quarter,
-- question and author group (staff or not). Mirrors Surveys::AverageGenerator
-- as used by the community monitor dashboard: published responses only,
-- enabled sentiment questions only, and quarters taken from the response's
-- creation time in the platform timezone.
--
-- Built on reporting_input_question_answers so the question_category rule
-- lives in one place. The dashboard can leave out admins' and moderators'
-- responses (a platform setting); this view never filters on that setting but
-- splits rows by staff, so both results can be computed.
WITH responses AS (
    SELECT
        ph.id AS phase_id,
        (i.created_at AT TIME ZONE 'UTC') AT TIME ZONE COALESCE(
            (SELECT ac.settings -> 'core' ->> 'timezone' FROM app_configurations ac LIMIT 1),
            'UTC'
        ) AS local_created_at,
        a.question_id,
        a.question_label,
        a.question_category,
        a.value_numeric,
        COALESCE(u.roles <> '[]'::jsonb, FALSE) AS staff
    FROM reporting_input_question_answers a
    INNER JOIN ideas i ON i.id = a.input_id
    INNER JOIN phases ph ON ph.id = i.creation_phase_id
    INNER JOIN ideas_phases ip ON ip.idea_id = i.id AND ip.phase_id = ph.id
    INNER JOIN custom_fields q ON q.id = a.question_id
    LEFT JOIN users u ON u.id = i.author_id
    WHERE ph.participation_method = 'community_monitor_survey'
        AND i.publication_status = 'published'
        AND a.question_type = 'sentiment_linear_scale'
        AND a.value_numeric IS NOT NULL
        AND q.enabled
)
SELECT
    phase_id,
    EXTRACT(YEAR FROM local_created_at)::integer AS year,
    EXTRACT(QUARTER FROM local_created_at)::integer AS quarter,
    question_id,
    question_label,
    question_category,
    staff,
    COUNT(*)::integer AS answer_count,
    SUM(value_numeric) AS answer_sum,
    ROUND(SUM(value_numeric) / COUNT(*), 1) AS average
FROM responses
GROUP BY phase_id, year, quarter, question_id, question_label, question_category, staff
