WITH regular_project_statuses AS -- project statuses that do not need to be calculated
         (SELECT item_id as project_id, action as status, acted_at::DATE as date
          FROM activities
          WHERE item_type = 'Project'
            AND action IN ('created', 'draft', 'published', 'archived', 'deleted')),

     last_statuses_for_continuous_projects AS
         (SELECT DISTINCT ON (project_id) *
          FROM regular_project_statuses JOIN projects ON project_id = projects.id
          WHERE process_type = 'continuous'
          ORDER BY project_id, date DESC),

     finished_statuses_for_continuous_projects AS
         (SELECT project_id, 'finished' as status, date
          FROM last_statuses_for_continuous_projects
          where status = 'archived'),

     finished_status_for_timeline_projects AS
         -- The project is considered finished the day after the last phase ends.
         (SELECT project_id, 'finished' as status, (MAX(end_at) + 1) as date
          FROM phases
          GROUP BY project_id
          HAVING MAX(end_at) < NOW()),

     project_statuses AS (
         SELECT * FROM regular_project_statuses
         UNION
         SELECT * FROM finished_status_for_timeline_projects
         UNION
         SELECT * FROM finished_statuses_for_continuous_projects
     )

SELECT *
FROM project_statuses
ORDER BY date DESC;
