-- Reporting view: one row per published comment on an input. Deleted comments
-- are excluded, as are comments on draft inputs, so every row joins
-- reporting_inputs. Internal comments (staff-only notes) live in another table
-- and are not included.
--
-- Mentions are replaced by a plain '@mention', so the body never names the
-- mentioned user. MentionService#add_span_around writes every mention as
-- <span class="cl-mention-user" ...>@Display name</span>, and the comment
-- sanitizer keeps only those attributes on a span.
SELECT
    c.id,
    c.idea_id AS input_id,
    c.parent_id,
    c.author_id AS user_id,
    regexp_replace(
        COALESCE(
            NULLIF(c.body_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
            (SELECT t.value FROM jsonb_each_text(c.body_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
        ),
        '<span[^>]*class="cl-mention-user"[^>]*>[^<]*</span>',
        '@mention',
        'g'
    ) AS body,
    c.likes_count,
    c.dislikes_count,
    c.created_at
FROM comments c
INNER JOIN ideas i ON i.id = c.idea_id
WHERE c.publication_status = 'published'
    AND i.publication_status IN ('submitted', 'published')
