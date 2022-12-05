-- This view has one record for each project with last status of each project.
-- Deleted projects are not included.
-- The additional 'finished' column isis computed based on whether the archived status
-- or where the last phase has been completed. It enables querying of projects that
-- are currently published (ie not finished via timeline) and projects that are finished.

WITH finished_statuses_for_timeline_projects AS
    -- The project is considered finished at the beginning of the day following the end
    -- date of the last phase.
    (SELECT phases.project_id, (MAX(phases.end_at) + 1)::timestamp as timestamp
    FROM phases
    GROUP BY phases.project_id
    HAVING MAX(phases.end_at) < NOW())

SELECT
    ap.publication_id as dimension_project_id,
    ap.publication_status as status,
    CASE
       WHEN p.process_type = 'continuous' AND ap.publication_status = 'archived' THEN true
       WHEN fsftp.project_id IS NOT NULL AND ap.publication_status != 'draft' THEN true
       ELSE false
    END as finished,
    CASE
       WHEN fsftp.project_id IS NOT NULL THEN fsftp.timestamp
       ELSE ap.updated_at
    END as timestamp,
    CASE
       WHEN fsftp.project_id IS NOT NULL THEN fsftp.timestamp::DATE
       ELSE ap.updated_at::DATE
    END as dimension_date_id
FROM admin_publications ap
LEFT JOIN projects p ON ap.publication_id = p.id
LEFT JOIN finished_statuses_for_timeline_projects fsftp ON fsftp.project_id = ap.publication_id
WHERE ap.publication_type = 'Project';
