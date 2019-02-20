SELECT sub.id AS project_id, CONCAT(sub.status_score, sub.active_score) AS score FROM (
  SELECT
    projects.id as id,
    CASE publication_status
      WHEN 'draft' THEN 1
      WHEN 'published' THEN 2
      WHEN 'archived' THEN 3
      ELSE 4
    END AS status_score,

    CASE publication_status
      WHEN 'archived' THEN 3
      ELSE
        CASE process_type
          WHEN 'continuous' THEN
            2
          WHEN 'timeline' THEN
            CASE
              WHEN EXISTS(SELECT 1 FROM phases WHERE start_at <= NOW()::date AND end_at >= NOW()::date AND project_id = projects.id) THEN 1
              ELSE 3
            END
        END
    END AS active_score

  FROM 
    projects
) AS sub