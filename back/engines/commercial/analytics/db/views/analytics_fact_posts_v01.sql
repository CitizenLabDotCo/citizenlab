-- Analytics view for posts
SELECT
    i.id,
    i.author_id AS user_id,
    i.project_id,
    adt.id as type_id,
    add.id AS created_date_id,
    addf.id as feedback_first_date_id, -- date
    (abf.feedback_first_date - i.created_at) as feedback_time_taken,
    COALESCE(abf.feedback_official,0) AS feedback_official,
    COALESCE(abf.feedback_status_change,0) AS feedback_status_change,
    CASE WHEN abf.feedback_first_date IS NULL THEN 1 ELSE 0 END AS feedback_none,
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count
from ideas i
INNER JOIN analytics_dimension_dates add ON add.date = i.created_at::DATE
INNER JOIN analytics_dimension_types adt ON adt.name = 'idea'
LEFT JOIN analytics_build_feedbacks AS abf ON abf.post_id = i.id
LEFT JOIN analytics_dimension_dates addf ON addf.date = abf.feedback_first_date::DATE

UNION ALL

SELECT
    i.id,
    i.author_id AS user_id,
    null AS project_id, -- initiative has no project
    adt.id as type_id,
    add.id AS created_date_id,
    addf.id as feedback_first_date_id, -- date
    (abf.feedback_first_date - i.created_at) as feedback_time_taken,
    COALESCE(abf.feedback_official,0) AS feedback_official,
    COALESCE(abf.feedback_status_change,0) AS feedback_status_change,
    CASE WHEN abf.feedback_first_date IS NULL THEN 1 ELSE 0 END AS feedback_none,
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count
FROM initiatives i
INNER JOIN analytics_dimension_types adt ON adt.name = 'initiative'
INNER JOIN analytics_dimension_dates add ON add.date = i.created_at::DATE
LEFT JOIN analytics_build_feedbacks AS abf ON abf.post_id = i.id
LEFT JOIN analytics_dimension_dates addf ON addf.date = abf.feedback_first_date::DATE;
