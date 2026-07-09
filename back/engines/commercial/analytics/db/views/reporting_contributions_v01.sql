-- Reporting view: the unified participation fact. One row per participatory
-- action a resident took, across all participation methods.
--
-- Shared derivation rules:
-- * participant_id identifies the author across contributions:
--   user id when known, the stable per-user-per-project author_hash for
--   anonymous ideas/comments, and the row id as a last resort (each such row
--   counts as its own participant).
-- * phase_id is structural where the source table links to a phase; for ideas
--   without a creation phase, and for comments and reactions, it is inferred
--   as the project phase whose [start_at, end_at) window contains
--   contributed_at (phases of a project never overlap).
-- * participation_method: for inputs it is how the input was collected (the
--   creation phase method, defaulting to 'ideation' for phase-less inputs,
--   mirroring reporting_inputs); for comments and reactions it is the method
--   of the phase active at action time, falling back to the input's
--   collection method (again defaulting to 'ideation').

-- Inputs: ideas, proposals, common-ground statements and survey responses
SELECT
    i.id,
    'input' AS type,
    NULL::text AS parent_type,
    NULL::uuid AS parent_id,
    i.contributed_at,
    i.created_at,
    COALESCE(creation_ph.participation_method, 'ideation') AS participation_method,
    i.project_id,
    COALESCE(i.creation_phase_id, inferred_ph.id) AS phase_id,
    i.author_id AS user_id,
    COALESCE(i.author_id::text, i.author_hash, i.id::text) AS participant_id
FROM (
    SELECT ideas.*, COALESCE(ideas.submitted_at, ideas.published_at, ideas.created_at) AS contributed_at
    FROM ideas
    WHERE ideas.publication_status = 'published'
) i
LEFT JOIN phases creation_ph ON creation_ph.id = i.creation_phase_id
LEFT JOIN phases inferred_ph
    ON i.creation_phase_id IS NULL
    AND inferred_ph.project_id = i.project_id
    AND i.contributed_at >= inferred_ph.start_at
    AND (inferred_ph.end_at IS NULL OR i.contributed_at < inferred_ph.end_at)

UNION ALL

-- Comments on inputs
SELECT
    c.id,
    'comment' AS type,
    'input' AS parent_type,
    c.idea_id AS parent_id,
    c.created_at AS contributed_at,
    c.created_at,
    COALESCE(inferred_ph.participation_method, input_creation_ph.participation_method, 'ideation') AS participation_method,
    i.project_id,
    inferred_ph.id AS phase_id,
    c.author_id AS user_id,
    COALESCE(c.author_id::text, c.author_hash, c.id::text) AS participant_id
FROM comments c
LEFT JOIN ideas i ON i.id = c.idea_id
LEFT JOIN phases input_creation_ph ON input_creation_ph.id = i.creation_phase_id
LEFT JOIN phases inferred_ph
    ON inferred_ph.project_id = i.project_id
    AND c.created_at >= inferred_ph.start_at
    AND (inferred_ph.end_at IS NULL OR c.created_at < inferred_ph.end_at)
WHERE c.publication_status = 'published'

UNION ALL

-- Reactions (likes/dislikes) on inputs and on comments
SELECT
    r.id,
    'reaction' AS type,
    r.parent_type,
    r.parent_id,
    r.created_at AS contributed_at,
    r.created_at,
    COALESCE(inferred_ph.participation_method, input_creation_ph.participation_method, 'ideation') AS participation_method,
    r.project_id,
    inferred_ph.id AS phase_id,
    r.user_id,
    COALESCE(r.user_id::text, r.id::text) AS participant_id
FROM (
    SELECT
        reactions.id,
        reactions.user_id,
        reactions.created_at,
        CASE WHEN reactions.reactable_type = 'Idea' THEN 'input' ELSE 'comment' END AS parent_type,
        reactions.reactable_id AS parent_id,
        COALESCE(ri.project_id, rci.project_id) AS project_id,
        COALESCE(ri.creation_phase_id, rci.creation_phase_id) AS input_creation_phase_id
    FROM reactions
    LEFT JOIN ideas ri ON reactions.reactable_type = 'Idea' AND ri.id = reactions.reactable_id
    LEFT JOIN comments rc ON reactions.reactable_type = 'Comment' AND rc.id = reactions.reactable_id
    LEFT JOIN ideas rci ON rci.id = rc.idea_id
    WHERE reactions.reactable_type IN ('Idea', 'Comment')
) r
LEFT JOIN phases input_creation_ph ON input_creation_ph.id = r.input_creation_phase_id
LEFT JOIN phases inferred_ph
    ON inferred_ph.project_id = r.project_id
    AND r.created_at >= inferred_ph.start_at
    AND (inferred_ph.end_at IS NULL OR r.created_at < inferred_ph.end_at)

UNION ALL

-- Votes: each picked input in a submitted basket (voting & participatory budgeting)
SELECT
    bi.id,
    'vote' AS type,
    'input' AS parent_type,
    bi.idea_id AS parent_id,
    b.submitted_at AS contributed_at,
    bi.created_at,
    ph.participation_method,
    ph.project_id,
    b.phase_id,
    b.user_id,
    -- basket id (not row id) as fallback: a basket is one person's submission
    COALESCE(b.user_id::text, b.id::text) AS participant_id
FROM baskets_ideas bi
INNER JOIN baskets b ON b.id = bi.basket_id
LEFT JOIN phases ph ON ph.id = b.phase_id
WHERE b.submitted_at IS NOT NULL

UNION ALL

-- Volunteerings: signing up for a cause
SELECT
    vv.id,
    'volunteering' AS type,
    NULL::text AS parent_type,
    NULL::uuid AS parent_id,
    vv.created_at AS contributed_at,
    vv.created_at,
    ph.participation_method,
    ph.project_id,
    vc.phase_id,
    vv.user_id,
    COALESCE(vv.user_id::text, vv.id::text) AS participant_id
FROM volunteering_volunteers vv
INNER JOIN volunteering_causes vc ON vc.id = vv.cause_id
LEFT JOIN phases ph ON ph.id = vc.phase_id

UNION ALL

-- Poll responses
SELECT
    pr.id,
    'poll_response' AS type,
    NULL::text AS parent_type,
    NULL::uuid AS parent_id,
    pr.created_at AS contributed_at,
    pr.created_at,
    ph.participation_method,
    ph.project_id,
    pr.phase_id,
    pr.user_id,
    COALESCE(pr.user_id::text, pr.id::text) AS participant_id
FROM polls_responses pr
LEFT JOIN phases ph ON ph.id = pr.phase_id

UNION ALL

-- Event attendances: registering for an event
SELECT
    ea.id,
    'attendance' AS type,
    NULL::text AS parent_type,
    NULL::uuid AS parent_id,
    ea.created_at AS contributed_at,
    ea.created_at,
    NULL::character varying AS participation_method,
    e.project_id,
    NULL::uuid AS phase_id,
    ea.attendee_id AS user_id,
    ea.attendee_id::text AS participant_id
FROM events_attendances ea
LEFT JOIN events e ON e.id = ea.event_id
