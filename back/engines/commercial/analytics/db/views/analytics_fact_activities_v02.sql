-- Analytics view for posts / comments / votes
SELECT
    i.id,
    i.author_id AS user_id,
    i.project_id,
    adt.id as type_id,
    add.id AS created_date_id,
    addf.id as feedback_recieved_date_id, -- date
    (abf.first_feedback_date - i.created_at) as time_to_feedback, -- seconds
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count,
    0 as participants
from ideas i
INNER JOIN analytics_dimension_dates add ON add.date = i.created_at::DATE
INNER JOIN analytics_dimension_types adt ON adt.name = 'idea'
LEFT JOIN analytics_build_feedbacks AS abf ON abf.post_id = i.id
LEFT JOIN analytics_dimension_dates addf ON addf.date = abf.first_feedback_date::DATE

UNION ALL

SELECT
    i.id,
    i.author_id AS user_id,
    null AS project_id, -- initiative has no project
    adt.id as type_id,
    add.id AS created_date_id,
    addf.id as feedback_recieved_date_id, -- date
    (abf.first_feedback_date - i.created_at) as time_to_feedback, -- seconds
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count,
    0 as participants
FROM initiatives i
INNER JOIN analytics_dimension_types adt ON adt.name = 'initiative'
INNER JOIN analytics_dimension_dates add ON add.date = i.created_at::DATE
LEFT JOIN analytics_build_feedbacks AS abf ON abf.post_id = i.id
LEFT JOIN analytics_dimension_dates addf ON addf.date = abf.first_feedback_date::DATE

UNION ALL

SELECT
    c.id,
    c.author_id AS user_id,
    i.project_id as project_id,
    adt.id as type_id,
    add.id AS created_date_id,
    null as feedback_recieved_date_id, -- date
    null as time_to_feedback, -- seconds
    c.upvotes_count + c.downvotes_count as votes_count,
    c.upvotes_count,
    c.downvotes_count,
    0 as participants
FROM comments c
INNER JOIN analytics_dimension_types adt ON adt.name = 'comment'
INNER JOIN analytics_dimension_dates add ON add.date = c.created_at::DATE
LEFT JOIN ideas i ON c.post_id = i.id -- only join ideas, initiative has no project

UNION ALL

SELECT
    v.id,
    v.user_id AS user_id,
    COALESCE(i.project_id, ic.project_id) AS project_id,
    adt.id as type_id,
    add.id AS created_date_id,
    null as feedback_recieved_date_id, -- date
    null as time_to_feedback, -- seconds
    1 as votes_count,
    CASE WHEN v.mode = 'up' THEN 1 ELSE 0 END AS upvotes_count,
    CASE WHEN v.mode = 'down' THEN 1 ELSE 0 END AS downvotes_count,
    1 as participants
FROM votes v
INNER JOIN analytics_dimension_types adt ON adt.name = 'vote'
INNER JOIN analytics_dimension_dates add ON add.date = v.created_at::DATE
LEFT JOIN ideas i ON i.id = v.votable_id
LEFT JOIN comments c ON c.id = v.votable_id
LEFT JOIN ideas ic ON ic.id = c.post_id;
;