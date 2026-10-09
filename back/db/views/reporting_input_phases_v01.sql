-- Reporting view: one row per phase an input belongs to. This is the link the
-- product uses to list inputs per phase: an idea collected in an ideation
-- phase and then put to a vote is linked to both phases. Draft inputs are
-- excluded, so every row joins reporting_inputs.
SELECT
    ip.id,
    ip.idea_id AS input_id,
    ip.phase_id,
    ip.created_at
FROM ideas_phases ip
INNER JOIN ideas i ON i.id = ip.idea_id
WHERE i.publication_status IN ('submitted', 'published')
