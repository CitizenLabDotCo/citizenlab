-- Analytics view for events
SELECT
    id,
    project_id AS dimension_project_id,
    created_at::DATE AS dimension_date_created_id,
    start_at::DATE AS dimension_date_start_id,
    end_at::DATE AS dimension_date_end_id
FROM events;
