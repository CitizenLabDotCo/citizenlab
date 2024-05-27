SELECT
    u.id,
    COALESCE(u.roles->0->>'type','citizen') AS role,
    u.invite_status,
    users_with_visits.dimension_user_id IS NOT NULL as has_visits
FROM users u
LEFT JOIN (
    SELECT DISTINCT dimension_user_id
    FROM analytics_fact_visits
) users_with_visits ON users_with_visits.dimension_user_id = u.id;
