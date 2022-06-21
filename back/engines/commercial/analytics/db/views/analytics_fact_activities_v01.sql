-- Analytics view for posts / comments / votes
SELECT
    i.id,
    i.author_id,
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
    c.id,
    c.author_id,
    null as project_id,
    add.id AS created_date_id,
    'comment' as activity_type,
    null as feedback_recieved_at, -- date
    0 as time_to_feedback, -- seconds
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count
FROM comments c
         INNER JOIN analytics_dimension_dates add ON add.date = c.created_at

UNION ALL

SELECT
    i.id,
    i.author_id,
    null as project_id,
    add.id AS created_date_id,
    'initiative' as activity_type,
    null as feedback_recieved_at, -- date
    0 as time_to_feedback, -- seconds
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count
FROM initiatives i
         INNER JOIN analytics_dimension_dates add ON add.date = i.created_at





