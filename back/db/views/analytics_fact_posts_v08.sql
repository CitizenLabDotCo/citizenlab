-- Analytics view for posts
SELECT
    i.id,
    i.author_id AS user_id,
    i.project_id AS dimension_project_id,
    adt.id as dimension_type_id,
    i.created_at::DATE AS dimension_date_created_id,
    abf.feedback_first_date::DATE as dimension_date_first_feedback_id,
    idea_status_id as dimension_status_id,
    (abf.feedback_first_date - i.created_at) as feedback_time_taken,
    COALESCE(abf.feedback_official,0) AS feedback_official,
    COALESCE(abf.feedback_status_change,0) AS feedback_status_change,
    CASE WHEN abf.feedback_first_date IS NULL THEN 1 ELSE 0 END AS feedback_none,
    likes_count + dislikes_count as reactions_count,
    likes_count,
    dislikes_count,
    i.publication_status
from ideas i
LEFT JOIN analytics_build_feedbacks AS abf ON abf.post_id = i.id
LEFT JOIN phases AS creation_phase on i.creation_phase_id = creation_phase.id
INNER JOIN analytics_dimension_types adt ON adt.name = CASE
                                                            WHEN creation_phase IS NULL THEN 'idea'
                                                            WHEN creation_phase.participation_method = 'proposals' THEN 'proposal'
                                                        END
WHERE creation_phase IS NULL OR creation_phase.participation_method = 'proposals'

UNION ALL

SELECT
    i.id,
    i.author_id AS user_id,
    null AS dimension_project_id, -- initiative has no project
    adt.id as dimension_type_id,
    i.created_at::DATE AS dimension_date_created_id,
    abf.feedback_first_date::DATE as dimension_date_first_feedback_id, -- date
    isc.initiative_status_id as dimension_status_id,
    (abf.feedback_first_date - i.created_at) as feedback_time_taken,
    COALESCE(abf.feedback_official,0) AS feedback_official,
    COALESCE(abf.feedback_status_change,0) AS feedback_status_change,
    CASE WHEN abf.feedback_first_date IS NULL THEN 1 ELSE 0 END AS feedback_none,
    likes_count + dislikes_count as reactions_count,
    likes_count,
    dislikes_count,
    i.publication_status
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
