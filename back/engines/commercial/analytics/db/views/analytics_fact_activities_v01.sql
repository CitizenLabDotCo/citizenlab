-- Analytics view for posts / comments / votes
SELECT
    i.id,
    i.author_id AS user_id,
    i.project_id,
    add.id AS created_date_id,
    'idea' as activity_type,
    null as feedback_recieved_at, -- date
    0 as time_to_feedback, -- seconds
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count
from ideas i
INNER JOIN analytics_dimension_dates add ON add.date = i.created_at

UNION ALL

SELECT
    i.id,
    i.author_id AS user_id,
    null AS project_id, -- initiative has no project
    add.id AS created_date_id,
    'initiative' as activity_type,
    null as feedback_recieved_at, -- date
    0 as time_to_feedback, -- seconds
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count
FROM initiatives i
INNER JOIN analytics_dimension_dates add ON add.date = i.created_at

UNION ALL

SELECT
    c.id,
    c.author_id AS user_id,
    i.project_id as project_id,
    add.id AS created_date_id,
    'comment' as activity_type,
    null as feedback_recieved_at, -- date
    0 as time_to_feedback, -- seconds
    c.upvotes_count + c.downvotes_count as votes_count,
    c.upvotes_count,
    c.downvotes_count
FROM comments c
INNER JOIN analytics_dimension_dates add ON add.date = c.created_at
LEFT JOIN ideas i ON c.post_id = i.id -- only join ideas, initiative has no project

UNION ALL

SELECT
    v.id,
    v.user_id AS user_id,
    COALESCE(i.project_id, ic.project_id) AS project_id,
    add.id AS created_date_id,
    'vote' as activity_type,
    null as feedback_recieved_at, -- date
    0 as time_to_feedback, -- seconds
    1 as votes_count,
    CASE WHEN v.mode = 'up' THEN 1 ELSE 0 END AS upvotes_count,
    CASE WHEN v.mode = 'down' THEN 1 ELSE 0 END AS downvotes_count
FROM votes v
INNER JOIN analytics_dimension_dates add ON add.date = v.created_at
LEFT JOIN ideas i ON i.id = v.votable_id
LEFT JOIN comments c ON c.id = v.votable_id
LEFT JOIN ideas ic ON ic.id = c.post_id;
;