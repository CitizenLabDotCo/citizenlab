-- Analytics view for sessions
SELECT
    id,
    monthly_user_hash,
    created_at::DATE AS dimension_date_created_id,
    updated_at::DATE AS dimension_date_updated_id,
    user_id AS dimension_user_id
FROM impact_tracking_sessions;
