-- Reporting view: the platform as a baseline for one project, as a few
-- aggregates per metric and never per project: the median, mean and quartiles
-- of a measure across the platform's projects (or phases), so a report about
-- one project can say how it compares without reading any other project's rows.
--
-- Counts projects that are not drafts and whose first phase has started.
-- Projects with no participation count as 0, so the median is not lifted by
-- leaving them out.
--
-- A metric is left out when fewer than 5 projects stand behind it: on a small
-- platform, a "median" of two projects is the other project's figure. For the
-- per-phase metrics this counts the projects behind the phases, not the phases.
--
-- Visitors are residents only (signed out, or highest role 'user'), the same
-- rule as reporting_phases.non_staff_visitors_count, and distinct per project:
-- summing per-phase counts would count a person once per phase.
WITH projects AS (
    SELECT p.id
    FROM reporting_projects p
    WHERE p.publication_status <> 'draft'
        AND p.start_at <= now()
),
contributions AS (
    SELECT
        c.project_id,
        COUNT(DISTINCT c.participant_id) AS participants,
        COUNT(*) AS contributions
    FROM reporting_contributions c
    GROUP BY c.project_id
),
visitors AS (
    SELECT pv.project_id, COUNT(DISTINCT s.visitor_id) AS visitors
    FROM reporting_pageviews pv
    JOIN reporting_sessions s ON s.id = pv.session_id
    WHERE pv.project_id IS NOT NULL
        AND (s.highest_role IS NULL OR s.highest_role = 'user')
    GROUP BY pv.project_id
),
phase_counts AS (
    SELECT ph.project_id, COUNT(*) AS phases
    FROM reporting_phases ph
    GROUP BY ph.project_id
),
survey_responses AS (
    SELECT c.phase_id, COUNT(*) AS responses
    FROM reporting_contributions c
    WHERE c.participation_method = 'native_survey'
    GROUP BY c.phase_id
),
samples AS (
    SELECT 'participants_per_project' AS metric, p.id AS project_id, COALESCE(c.participants, 0) AS value
    FROM projects p LEFT JOIN contributions c ON c.project_id = p.id
    UNION ALL
    SELECT 'contributions_per_project', p.id, COALESCE(c.contributions, 0)
    FROM projects p LEFT JOIN contributions c ON c.project_id = p.id
    UNION ALL
    SELECT 'visitors_per_project', p.id, COALESCE(v.visitors, 0)
    FROM projects p LEFT JOIN visitors v ON v.project_id = p.id
    UNION ALL
    SELECT 'phases_per_project', p.id, COALESCE(pc.phases, 0)
    FROM projects p LEFT JOIN phase_counts pc ON pc.project_id = p.id
    UNION ALL
    SELECT 'online_voters_per_voting_phase', ph.project_id, COALESCE(ph.online_voters_count, 0)
    FROM reporting_phases ph
    JOIN projects p ON p.id = ph.project_id
    WHERE ph.participation_method = 'voting' AND ph.start_at <= now()
    UNION ALL
    SELECT 'survey_responses_per_survey_phase', ph.project_id, COALESCE(sr.responses, 0)
    FROM reporting_phases ph
    JOIN projects p ON p.id = ph.project_id
    LEFT JOIN survey_responses sr ON sr.phase_id = ph.id
    WHERE ph.participation_method = 'native_survey' AND ph.start_at <= now()
)
SELECT
    metric,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY value) AS median,
    AVG(value)::double precision AS mean,
    percentile_cont(0.25) WITHIN GROUP (ORDER BY value) AS p25,
    percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75,
    COUNT(DISTINCT project_id)::integer AS projects_counted
FROM samples
GROUP BY metric
HAVING COUNT(DISTINCT project_id) >= 5
