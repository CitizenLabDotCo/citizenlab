-- Reporting view: the sign-up funnel, as totals per day sign-up started and
-- sign-up method, never per person: how many people started signing up and
-- how many of them completed registration.
--
-- Built on the activities log, not the users table: an account whose
-- confirmation code expires before it was confirmed is deleted
-- (ExpireConfirmationCodeOrDeleteJob), and so is a pending invitee's when the
-- invitation is deleted, so the users table has lost most people who stopped.
-- Their activities stay: deleting a user only clears activities.user_id.
--
-- The 'created' activity records how the person signed up (its payload flow)
-- since 2024-08-15; earlier sign-ups have no method. Accounts an invitation
-- created are logged with flow 'invitation' from October 2026; before that
-- they read as 'email_confirmation', so an older invitee is only recognised
-- once they accepted (the accepted activity names them). Imported authors
-- (flow 'importer') never signed up, so they are left out.
WITH sign_ups AS (
    SELECT DISTINCT ON (a.item_id)
        a.item_id AS account_id,
        a.acted_at,
        a.payload ->> 'flow' AS flow,
        a.payload ->> 'method' AS provider
    FROM activities a
    WHERE a.item_type = 'User'
        AND a.action = 'created'
        AND a.payload ->> 'flow' IS DISTINCT FROM 'importer'
    ORDER BY a.item_id, a.acted_at
),
accepted_invitees AS (
    SELECT DISTINCT user_id AS account_id
    FROM activities
    WHERE item_type = 'Invite' AND action = 'accepted' AND user_id IS NOT NULL
),
completed AS (
    SELECT DISTINCT item_id AS account_id
    FROM activities
    WHERE item_type = 'User' AND action = 'completed_registration'
)
SELECT
    ((s.acted_at AT TIME ZONE 'UTC') AT TIME ZONE COALESCE(
        (SELECT ac.settings -> 'core' ->> 'timezone' FROM app_configurations ac LIMIT 1),
        'UTC'
    ))::date AS started_date,
    CASE
        WHEN s.flow = 'invitation' OR ai.account_id IS NOT NULL THEN 'invitation'
        ELSE s.flow
    END AS sign_up_method,
    CASE WHEN s.flow = 'sso' AND ai.account_id IS NULL THEN s.provider END AS sso_provider,
    COUNT(*)::integer AS started_count,
    COUNT(c.account_id)::integer AS completed_count
FROM sign_ups s
LEFT JOIN accepted_invitees ai ON ai.account_id = s.account_id
LEFT JOIN completed c ON c.account_id = s.account_id
GROUP BY started_date, sign_up_method, sso_provider
