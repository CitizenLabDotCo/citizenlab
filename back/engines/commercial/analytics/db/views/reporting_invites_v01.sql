-- Reporting view: invitations as totals per day invited and inviter role, never
-- per person: no invitee or inviter ids. Acceptances are counted against the
-- day of the invitation, so each row reads as "of the people invited that day,
-- how many accepted".
--
-- The inviter's role follows reporting_staff_activities: the highest role now,
-- as the platform keeps no role history. Days are in the platform timezone.
SELECT
    ((i.created_at AT TIME ZONE 'UTC') AT TIME ZONE COALESCE(
        (SELECT ac.settings -> 'core' ->> 'timezone' FROM app_configurations ac LIMIT 1),
        'UTC'
    ))::date AS invited_date,
    CASE
        WHEN u.id IS NULL THEN NULL
        WHEN u.roles @> '[{"type":"admin"}]' THEN 'admin'
        WHEN u.roles @> '[{"type":"space_moderator"}]' THEN 'space_moderator'
        WHEN u.roles @> '[{"type":"project_folder_moderator"}]' THEN 'project_folder_moderator'
        WHEN u.roles @> '[{"type":"project_moderator"}]' THEN 'project_moderator'
        ELSE 'former_staff'
    END AS inviter_role,
    COALESCE(
        u.email ~* 'citizenlab\.(eu|be|ch|de|nl|co|uk|us|cl|dk|pl)$'
        OR u.email ~* 'govocal\.(com|eu|be|ch|de|nl|co|uk|us|cl|dk|pl)$',
        FALSE
    ) AS govocal_staff,
    i.send_invite_email AS email_sent,
    COUNT(*)::integer AS invites_count,
    COUNT(i.accepted_at)::integer AS accepted_count
FROM invites i
LEFT JOIN users u ON u.id = i.inviter_id
GROUP BY invited_date, inviter_role, govocal_staff, email_sent
