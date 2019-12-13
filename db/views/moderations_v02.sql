SELECT id, 'Idea' moderatable_type, slug AS context_slug, 'Idea' context_type, title_multiloc AS context_multiloc, body_multiloc AS content_multiloc, published_at AS created_at, moderation_status
FROM ideas
UNION ALL
SELECT id, 'Initiative' moderatable_type, slug AS context_slug, 'Initiative' context_type, title_multiloc AS context_multiloc, body_multiloc AS content_multiloc, published_at as created_at, moderation_status
FROM initiatives
UNION ALL
SELECT comments.id, 'Comment' moderatable_type, union_posts.slug AS context_slug, 'Idea' context_type, union_posts.title_multiloc AS context_multiloc, comments.body_multiloc AS content_multiloc, comments.created_at, moderation_status
FROM comments
LEFT OUTER JOIN union_posts
ON union_posts.id = comments.post_id