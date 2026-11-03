-- Reporting view: one row per vote a user cast on an input in a submitted
-- voting or participatory-budgeting basket.
SELECT
    bi.id,
    bi.idea_id AS input_id,
    b.user_id,
    b.submitted_at AS voted_at,
    bi.votes AS weight
FROM baskets_ideas bi
INNER JOIN baskets b ON b.id = bi.basket_id
WHERE b.submitted_at IS NOT NULL
