SELECT
    id,
    COALESCE(roles->0->>'type','citizen') AS role,
    invite_status,
    custom_field_values->>'gender' as gender,
    custom_field_values->>'birthyear' as birthyear
FROM users;
