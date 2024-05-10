SELECT
    u.id,
    COALESCE(u.roles->0->>'type','citizen') AS role,
    u.invite_status,
    CASE v.id
        WHEN NULL THEN FALSE
        ELSE TRUE
    END AS is_visitor
FROM users u
LEFT JOIN analytics_fact_visits v on v.dimension_user_id = u.id;
