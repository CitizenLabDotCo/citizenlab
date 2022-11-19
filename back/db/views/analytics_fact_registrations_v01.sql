-- Analytics view for registrations
SELECT
    id,
    id as dimension_user_id,
    registration_completed_at::DATE AS dimension_date_registration_id
FROM Users
WHERE registration_completed_at IS NOT NULL;
