SELECT ideas.id, 'Idea' moderatable_type, NULL post_type, NULL::uuid post_id, NULL post_slug, NULL::jsonb post_title_multiloc, projects.id AS project_id, projects.slug AS project_slug, projects.title_multiloc AS project_title_multiloc, ideas.title_multiloc AS content_title_multiloc, ideas.body_multiloc AS content_body_multiloc, ideas.slug AS content_slug, ideas.published_at AS created_at, moderation_moderation_statuses.status AS moderation_status
FROM ideas
LEFT OUTER JOIN moderation_moderation_statuses
ON moderation_moderation_statuses.moderatable_id = ideas.id
LEFT OUTER JOIN projects
ON projects.id = ideas.project_id

UNION ALL

SELECT comments.id, 'Comment' moderatable_type, 'Idea' post_type, ideas.id AS post_id, ideas.slug AS post_slug, ideas.title_multiloc AS post_title_multiloc, projects.id AS project_id, projects.slug AS project_slug, projects.title_multiloc AS project_title_multiloc, NULL::jsonb AS content_title_multiloc, comments.body_multiloc AS content_body_multiloc, NULL AS content_slug, comments.created_at, moderation_moderation_statuses.status AS moderation_status
FROM comments
LEFT OUTER JOIN moderation_moderation_statuses
ON moderation_moderation_statuses.moderatable_id = comments.id
LEFT OUTER JOIN ideas
ON ideas.id = comments.idea_id
LEFT OUTER JOIN projects
ON projects.id = ideas.project_id
