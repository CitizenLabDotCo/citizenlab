-- Reporting view: one row per reaction (like/dislike) on an input. Reactions
-- on comments are not included here; they only appear in
-- reporting_contributions.
SELECT
    r.id,
    r.reactable_id AS input_id,
    r.user_id,
    r.created_at AS reacted_at,
    r.mode
FROM reactions r
WHERE r.reactable_type = 'Idea'
