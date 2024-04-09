-- Analytics view for all types of participation based on the activities table

SELECT
    a.id,
    a.user_id AS dimension_user_id,
    -- CASE WHEN
    --     a.user_id IS NULL
    --     THEN CONCAT('anonymous-', a.id)
    --     ELSE a.user_id
    -- END AS participant_id,
    a.project_id AS dimension_project_id,
    a.acted_at::DATE AS dimension_date_created_id,
    a.item_type AS item_type,
    a.action AS action_type
FROM activities a
WHERE
    (a.item_type = 'Idea' AND a.action = 'published') OR
    (a.item_type = 'Comment' AND a.action = 'created') OR
    (a.item_type = 'Initiative' AND a.action = 'published') OR
    (a.item_type = 'Reaction' AND a.action in ('idea_liked', 'idea_disliked', 'comment_liked', 'initiative_liked')) OR
    (a.item_type = 'Basket' AND a.action = 'created') OR
    (a.item_type = 'Polls::Response' AND a.action = 'created') OR
    (a.item_type = 'Volunteering::Volunteer' AND a.action = 'created') OR
    (a.item_type = 'Events::Attendance' AND a.action = 'created') OR
    (a.item_type = 'Follower' AND a.action = 'created');
