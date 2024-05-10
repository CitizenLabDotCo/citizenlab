SELECT
    id,
    COALESCE(roles->0->>'type','citizen') AS role,
    invite_status,
    CASE v.id
        WHEN NULL THEN FALSE
        ELSE TRUE
    END AS is_visitor
FROM users,
LEFT JOIN analytics_fact_visits v on v.dimension_user_id = users.id
