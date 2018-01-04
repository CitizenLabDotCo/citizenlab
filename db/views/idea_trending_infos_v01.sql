SELECT id as idea_id, 
       GREATEST(last_comment_at, last_upvoted_at, published_at) AS last_activity_at,
       to_timestamp(round((GREATEST((comments_at.comments_count * mean_comment_at),0) 
                           + GREATEST((upvotes_at.upvotes_count * mean_upvoted_at),0) 
                           + extract(epoch from published_at)) 
                          / (GREATEST(comments_at.comments_count, 0.0) + GREATEST(upvotes_at.upvotes_count, 0.0) + 1.0))) AS mean_activity_at
FROM ideas
FULL OUTER JOIN
(SELECT idea_id, MAX(created_at) AS last_comment_at, AVG(extract(epoch from created_at)) AS mean_comment_at, COUNT(idea_id) AS comments_count
 FROM comments
 GROUP BY idea_id) AS comments_at
ON id = comments_at.idea_id
FULL OUTER JOIN
(SELECT votable_id, MAX(created_at) AS last_upvoted_at, AVG(extract(epoch from created_at)) AS mean_upvoted_at, COUNT(votable_id) AS upvotes_count
 FROM votes
 WHERE mode = 'up' AND votable_type = 'Idea'
 GROUP BY votable_id) AS upvotes_at
ON id = upvotes_at.votable_id;