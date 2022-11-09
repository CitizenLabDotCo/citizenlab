-- This view lists the last statuses of each project.

-- All statuses, except 'finished', are sourced directly from the 'activities' table.
-- The view has one record for each project with one of those "regular" statuses. The
-- finished on the other hand is computed based on some application logic and does not
-- correspond to any status used in activities or admin publications. The finished
-- status comes in addition to the regular status. Thus, the view has two records for
-- finished projects.

WITH last_project_statuses AS -- project statuses that do not need to be calculated
         (SELECT DISTINCT ON (item_id) item_id as project_id, action as status, acted_at as timestamp
          FROM activities
          WHERE item_type = 'Project'
            AND action IN ('draft', 'published', 'archived', 'deleted')
          ORDER BY item_id, acted_at DESC),

     finished_statuses_for_continuous_projects AS
         (SELECT project_id, 'finished' as status, timestamp
          FROM last_project_statuses lps JOIN projects p ON lps.project_id = p.id
          where p.process_type = 'continuous' AND lps.status = 'archived'),

     finished_statuses_for_timeline_projects AS
         -- The project is considered finished at the beginning of the day following the end
         -- date of the last phase.
         (SELECT phases.project_id, 'finished' as status, (MAX(phases.end_at) + 1)::timestamp as timestamp
          FROM phases JOIN projects ON phases.project_id = projects.id
          WHERE projects.process_type != 'draft' -- a project cannot be finished if it's a draft
          GROUP BY phases.project_id
          HAVING MAX(phases.end_at) < NOW()),

     project_statuses AS (
         SELECT * FROM last_project_statuses
         UNION
         SELECT * FROM finished_statuses_for_timeline_projects
         UNION
         SELECT * FROM finished_statuses_for_continuous_projects
     )

SELECT project_id      as dimension_project_id,
       status,
       timestamp,
       timestamp::DATE as dimension_date_id
FROM project_statuses
ORDER BY timestamp DESC;
