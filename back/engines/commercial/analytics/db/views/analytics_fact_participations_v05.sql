-- Analytics view for all types of participation

-- Ideas & Native surveys
SELECT
    i.id,
    i.author_id AS dimension_user_id,
    i.project_id AS dimension_project_id,
    CASE
        WHEN ph.participation_method = 'native_survey' THEN survey.id
        ELSE idea.id
    END AS dimension_type_id,
    i.created_at::DATE AS dimension_date_created_id,
    likes_count + dislikes_count AS reactions_count,
    likes_count,
    dislikes_count
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
    likes_count + dislikes_count AS reactions_count,
    likes_count,
    dislikes_count
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
    c.likes_count + c.dislikes_count AS reactions_count,
    c.likes_count,
    c.dislikes_count
FROM comments c
INNER JOIN analytics_dimension_types adt ON adt.name = 'comment' AND adt.parent = LOWER(c.post_type)
LEFT JOIN ideas i ON c.post_id = i.id -- only join ideas, initiative has no project

UNION ALL

-- Votes
SELECT
    r.id,
    r.user_id AS dimension_user_id,
    COALESCE(i.project_id, ic.project_id) AS dimension_project_id,
    adt.id AS dimension_type_id,
    r.created_at::DATE AS dimension_date_created_id,
    1 AS reactions_count,
    CASE WHEN r.mode = 'up' THEN 1 ELSE 0 END AS likes_count,
    CASE WHEN r.mode = 'down' THEN 1 ELSE 0 END AS dislikes_count
FROM reactions r
INNER JOIN analytics_dimension_types adt ON adt.name = 'reaction' AND adt.parent = LOWER(r.reactable_type)
LEFT JOIN ideas i ON i.id = r.reactable_id
LEFT JOIN comments c ON c.id = r.reactable_id
LEFT JOIN ideas ic ON ic.id = c.post_id

UNION ALL

-- Poll Response
SELECT
    pr.id,
    pr.user_id AS dimension_user_id,
    COALESCE(p.project_id, pr.phase_id) AS dimension_project_id,
    adt.id AS dimension_type_id,
    pr.created_at::DATE AS dimension_date_created_id,
    0 AS reactions_count,
    0 AS likes_count,
    0 AS dislikes_count
FROM polls_responses pr
LEFT JOIN phases p ON p.id = pr.phase_id
INNER JOIN analytics_dimension_types adt ON adt.name = 'poll'

UNION ALL

-- Volunteering
SELECT
    vv.id,
    vv.user_id AS dimension_user_id,
    COALESCE(p.project_id, vc.phase_id) AS dimension_project_id,
    adt.id AS dimension_type_id,
    vv.created_at::DATE AS dimension_date_created_id,
    0 AS reactions_count,
    0 AS likes_count,
    0 AS dislikes_count
FROM volunteering_volunteers vv
LEFT JOIN volunteering_causes vc ON vc.id = vv.cause_id
LEFT JOIN phases p ON p.id = vc.phase_id
INNER JOIN analytics_dimension_types adt ON adt.name = 'volunteer';
