SELECT ideas.id AS idea_id,
       GREATEST(comments_at.last_comment_at, likes_at.last_liked_at, ideas.published_at) AS last_activity_at,
       to_timestamp(round((GREATEST(comments_at.comments_count::double precision * comments_at.mean_comment_at, 0::double precision) + GREATEST(likes_at.likes_count::double precision * likes_at.mean_liked_at, 0::double precision) + date_part('epoch'::text, ideas.published_at)) / (GREATEST(comments_at.comments_count::numeric, 0.0) + GREATEST(likes_at.likes_count::numeric, 0.0) + 1.0)::double precision)) AS mean_activity_at
FROM ideas
         FULL JOIN ( SELECT comments.idea_id,
                            max(comments.created_at) AS last_comment_at,
                            avg(date_part('epoch'::text, comments.created_at)) AS mean_comment_at,
                            count(comments.idea_id) AS comments_count
                     FROM comments
                     GROUP BY comments.idea_id) comments_at ON ideas.id = comments_at.idea_id
         FULL JOIN ( SELECT reactions.reactable_id AS reactable_id,
                            max(reactions.created_at) AS last_liked_at,
                            avg(date_part('epoch'::text, reactions.created_at)) AS mean_liked_at,
                            count(reactions.reactable_id) AS likes_count
                     FROM reactions
                     WHERE reactions.mode::text = 'up'::text AND reactions.reactable_type::text = 'Idea'::text
                     GROUP BY reactions.reactable_id) likes_at ON ideas.id = likes_at.reactable_id;