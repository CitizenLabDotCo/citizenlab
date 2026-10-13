SELECT
    id,
    COALESCE(roles->0->>'type','citizen') AS role,
    invite_status
FROM users;
