SELECT
    id,
    COALESCE(roles->0->>'type','citizen') AS role
FROM users;
