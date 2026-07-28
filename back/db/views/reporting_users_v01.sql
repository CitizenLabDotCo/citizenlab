-- Reporting view: one row per active registered user. Users who are not (yet)
-- active are excluded: pending invitations, incomplete registrations and
-- currently blocked accounts. Deliberately carries no personally identifiable
-- information.
SELECT
    u.id,
    u.registration_completed_at AS registered_at,
    u.created_at,
    CASE
        WHEN u.roles @> '[{"type":"admin"}]' THEN 'admin'
        WHEN u.roles @> '[{"type":"space_moderator"}]' THEN 'space_moderator'
        WHEN u.roles @> '[{"type":"project_folder_moderator"}]' THEN 'project_folder_moderator'
        WHEN u.roles @> '[{"type":"project_moderator"}]' THEN 'project_moderator'
        ELSE 'user'
    END AS highest_role
FROM users u
WHERE u.registration_completed_at IS NOT NULL
    AND (u.invite_status IS NULL OR u.invite_status <> 'pending')
    AND (u.block_end_at IS NULL OR u.block_end_at < now())
