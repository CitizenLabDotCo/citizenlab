SELECT id, 'Idea' moderatable_type, slug AS context_slug, 'Idea' context_type, title_multiloc AS context_multiloc, body_multiloc AS content_multiloc, published_at AS created_at, moderation_statuses.status AS moderation_status
FROM ideas
LEFT OUTER JOIN moderation_statuses
ON moderation_statuses.moderatable_id = ideas.id
UNION ALL
SELECT id, 'Initiative' moderatable_type, slug AS context_slug, 'Initiative' context_type, title_multiloc AS context_multiloc, body_multiloc AS content_multiloc, published_at AS created_at, moderation_statuses.status AS moderation_status
FROM initiatives
LEFT OUTER JOIN moderation_statuses
ON moderation_statuses.moderatable_id = initiatives.id
UNION ALL
SELECT comments.id, 'Comment' moderatable_type, union_posts.slug AS context_slug, 'Idea' context_type, union_posts.title_multiloc AS context_multiloc, comments.body_multiloc AS content_multiloc, comments.created_at, moderation_statuses.status AS moderation_status
FROM comments
LEFT OUTER JOIN moderation_statuses
ON moderation_statuses.moderatable_id = comments.id
LEFT OUTER JOIN union_posts
ON union_posts.id = comments.post_id