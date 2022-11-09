-- Analytics view for all types of participation

-- Ideas & Native surveys
SELECT
    i.id,
    i.author_id AS dimension_user_id,
    i.project_id AS dimension_project_id,
    CASE
        WHEN pr.participation_method = 'native_survey' OR ph.participation_method = 'native_survey' THEN survey.id
        ELSE idea.id
    END AS dimension_type_id,
    i.created_at::DATE AS dimension_date_created_id,
    upvotes_count + downvotes_count AS votes_count,
    upvotes_count,
    downvotes_count
FROM ideas i
LEFT JOIN projects pr ON pr.id = i.project_id
LEFT JOIN phases ph ON ph.id = i.creation_phase_id
INNER JOIN analytics_dimension_types idea ON idea.name = 'idea'
LEFT JOIN analytics_dimension_types survey ON survey.name = 'survey'

UNION ALL

-- Initiatives/Proposals
SELECT
    i.id,
    i.author_id AS dimension_user_id,
    null AS dimension_project_id, -- initiative has no project
    adt.id AS dimension_type_id,
    i.created_at::DATE AS dimension_date_created_id,
    upvotes_count + downvotes_count AS votes_count,
    upvotes_count,
    downvotes_count
FROM initiatives i
INNER JOIN analytics_dimension_types adt ON adt.name = 'initiative'

UNION ALL

-- Comments
SELECT
    c.id,
    c.author_id AS dimension_user_id,
    i.project_id AS dimension_project_id,
    adt.id AS dimension_type_id,
    c.created_at::DATE AS dimension_date_created_id,
    c.upvotes_count + c.downvotes_count AS votes_count,
    c.upvotes_count,
    c.downvotes_count
FROM comments c
INNER JOIN analytics_dimension_types adt ON adt.name = 'comment'
LEFT JOIN ideas i ON c.post_id = i.id -- only join ideas, initiative has no project

UNION ALL

-- Votes
SELECT
    v.id,
    v.user_id AS dimension_user_id,
    COALESCE(i.project_id, ic.project_id) AS dimension_project_id,
    adt.id AS dimension_type_id,
    v.created_at::DATE AS dimension_date_created_id,
    1 AS votes_count,
    CASE WHEN v.mode = 'up' THEN 1 ELSE 0 END AS upvotes_count,
    CASE WHEN v.mode = 'down' THEN 1 ELSE 0 END AS downvotes_count
FROM votes v
INNER JOIN analytics_dimension_types adt ON adt.name = 'vote'
LEFT JOIN ideas i ON i.id = v.votable_id
LEFT JOIN comments c ON c.id = v.votable_id
LEFT JOIN ideas ic ON ic.id = c.post_id

UNION ALL

-- Poll Response
SELECT
    pr.id,
    pr.user_id AS dimension_user_id,
    COALESCE(p.project_id, pr.participation_context_id) AS dimension_project_id,
    adt.id AS dimension_type_id,
    pr.created_at::DATE AS dimension_date_created_id,
    0 AS votes_count,
    0 AS upvotes_count,
    0 AS downvotes_count
FROM polls_responses pr
LEFT JOIN phases p ON p.id = pr.participation_context_id
INNER JOIN analytics_dimension_types adt ON adt.name = 'poll'

UNION ALL

-- Volunteering
SELECT
    vv.id,
    vv.user_id AS dimension_user_id,
    COALESCE(p.project_id, vc.participation_context_id) AS dimension_project_id,
    adt.id AS dimension_type_id,
    vv.created_at::DATE AS dimension_date_created_id,
    0 AS votes_count,
    0 AS upvotes_count,
    0 AS downvotes_count
FROM volunteering_volunteers vv
LEFT JOIN volunteering_causes vc ON vc.id = vv.cause_id
LEFT JOIN phases p ON p.id = vc.participation_context_id
INNER JOIN analytics_dimension_types adt ON adt.name = 'volunteer';
