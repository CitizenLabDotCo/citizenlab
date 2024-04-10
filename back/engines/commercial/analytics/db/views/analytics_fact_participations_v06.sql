-- Analytics view for all types of participation based on the activities table

SELECT
    a.id,
    a.user_id AS dimension_user_id,
    COALESCE(a.user_id, a.id) AS participant_id,
    a.project_id AS dimension_project_id,
    a.acted_at::DATE AS dimension_date_created_id,
    a.item_type AS item_type,
    a.action AS action_type,
    a.payload->>'reactable_type' AS reactable_type,
    (
      COALESCE(a.user_id::CHAR, a.id::CHAR) || 
      '_' ||
      COALESCE(a.payload->>'reactable_type', '') ||
      '_' ||
      COALESCE(a.payload->>'reactable_id', '')
    ) AS reaction_id
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
