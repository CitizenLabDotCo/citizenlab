-- Analytics view for registrations & invites
SELECT
    u.id,
    u.id as dimension_user_id,
    u.registration_completed_at::DATE AS dimension_date_registration_id,
    i.created_at::DATE AS dimension_date_invited_id,
    i.accepted_at::DATE AS dimension_date_accepted_id
FROM users u
LEFT JOIN invites i ON i.invitee_id = u.id;
