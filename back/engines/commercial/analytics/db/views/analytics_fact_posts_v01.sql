-- Analytics view for posts
SELECT
    i.id,
    i.author_id AS user_id,
    i.project_id,
    adt.id as type_id,
    i.created_at::DATE AS created_date_id,
    abf.feedback_first_date::DATE as feedback_first_date,
    (abf.feedback_first_date - i.created_at) as feedback_time_taken,
    COALESCE(abf.feedback_official,0) AS feedback_official,
    COALESCE(abf.feedback_status_change,0) AS feedback_status_change,
    CASE WHEN abf.feedback_first_date IS NULL THEN 1 ELSE 0 END AS feedback_none,
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count,
    idea_status_id as status_id
from ideas i
INNER JOIN analytics_dimension_types adt ON adt.name = 'idea'
LEFT JOIN analytics_build_feedbacks AS abf ON abf.post_id = i.id

UNION ALL

SELECT
    i.id,
    i.author_id AS user_id,
    null AS project_id, -- initiative has no project
    adt.id as type_id,
    i.created_at::DATE AS created_date_id,
    abf.feedback_first_date::DATE as feedback_first_date, -- date
    (abf.feedback_first_date - i.created_at) as feedback_time_taken,
    COALESCE(abf.feedback_official,0) AS feedback_official,
    COALESCE(abf.feedback_status_change,0) AS feedback_status_change,
    CASE WHEN abf.feedback_first_date IS NULL THEN 1 ELSE 0 END AS feedback_none,
    upvotes_count + downvotes_count as votes_count,
    upvotes_count,
    downvotes_count,
    isc.initiative_status_id as status_id
FROM initiatives i
INNER JOIN analytics_dimension_types adt ON adt.name = 'initiative'
LEFT JOIN analytics_build_feedbacks AS abf ON abf.post_id = i.id
LEFT JOIN initiative_status_changes AS isc
    ON isc.initiative_id = i.id and 
       isc.updated_at = (
        select MAX(isc_.updated_at)
        from initiative_status_changes as isc_
        where isc_.initiative_id = i.id
       );
