SELECT sub.id AS project_id, CONCAT(sub.status_score, sub.active_score, sub.hot_score, sub.recency_score, sub.action_score) AS score FROM (
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
    END AS active_score,

    CASE process_type
      WHEN 'timeline' THEN
        CASE
          WHEN EXISTS(SELECT 1 FROM phases WHERE (ABS(start_at - NOW()::date) <= 7 OR ABS(end_at - NOW()::date) <= 7) AND project_id = projects.id) THEN 1
          ELSE 2
        END
      WHEN 'continuous' THEN
        CASE
          WHEN (NOW()::date - projects.created_at::date) <= 7 THEN 1
          ELSE 2
        END
    END AS hot_score,

    LPAD(
      CASE process_type
        WHEN 'timeline' THEN COALESCE(MIN(joined_phases.recency_diff), NOW()::date - projects.created_at::date)
        WHEN 'continuous' THEN NOW()::date - projects.created_at::date
      END::text,
      5,
      '0'
    ) AS recency_score,

    CASE publication_status
      WHEN 'archived' THEN 9
      ELSE
        CASE process_type
          WHEN 'continuous' THEN
            CASE projects.participation_method
              WHEN 'ideation' THEN
                CASE
                  WHEN projects.posting_enabled THEN 1
                  WHEN projects.commenting_enabled THEN 4
                  WHEN projects.voting_enabled THEN 5
                  ELSE 6
                END
              WHEN 'budgeting' THEN 2
              WHEN 'survey' THEN 3
              WHEN 'information' THEN 7
              ELSE 8
            END
          WHEN 'timeline' THEN
            CASE COALESCE(max(active_phases.participation_method), 'no_active_pc') /*,bool_or(active_phases.posting_enabled),bool_or(active_phases.commenting_enabled),bool_or(active_phases.voting_enabled))*/
              WHEN 'no_active_pc' THEN 9
              WHEN 'ideation' THEN
                CASE
                  WHEN bool_or(active_phases.posting_enabled) THEN 1
                  WHEN bool_or(active_phases.commenting_enabled) THEN 4
                  WHEN bool_or(active_phases.voting_enabled) THEN 5
                  ELSE 6
                END
              WHEN 'budgeting' THEN 2
              WHEN 'survey' THEN 3
              WHEN 'information' THEN 7
              ELSE 8
            END
        END
    END AS action_score

  FROM 
    projects
  LEFT OUTER JOIN 
    (
      SELECT id, project_id, LEAST(ABS(NOW()::date - start_at), ABS(NOW()::date - end_at)) AS recency_diff FROM phases
    ) AS joined_phases ON joined_phases.project_id = projects.id
    LEFT JOIN
    (
      SELECT * FROM phases WHERE start_at <= NOW()::date AND end_at >= NOW()::date
    ) AS active_phases
    ON active_phases.id = joined_phases.id
  GROUP BY projects.id
) AS sub