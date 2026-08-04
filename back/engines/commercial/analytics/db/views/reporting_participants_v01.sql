-- Reporting view: one row per participant, aggregated from
-- reporting_contributions. A participant is the (best-effort) human being
-- behind one or more contributions; anonymous contributions without a stable
-- author hash each count as their own participant.
SELECT
    c.participant_id AS id,
    -- constant per participant_id: the user id itself, or NULL when anonymous
    MAX(c.user_id::text)::uuid AS user_id,
    MIN(c.contributed_at) AS created_at,
    BOOL_AND(c.user_id IS NULL) AS anonymous
FROM reporting_contributions c
GROUP BY c.participant_id
