-- Calculate the first feedback date
SELECT
    post_id,
    post_type,
    feedback_type,
    min(first_feedback_date) AS first_feedback_date
FROM (
    SELECT
        item_id AS post_id,
        item_type AS post_type,
        'changed_status' AS feedback_type,
        MIN(created_at) AS first_feedback_date
    FROM activities
    WHERE
        action = 'changed_status' AND
        item_type = 'Initiative'
    GROUP BY item_id, item_type

    UNION ALL

    SELECT
        post_id,
        post_type,
        'official_feedback' AS feedback_type,
        MIN(created_at) AS first_feedback_date
    FROM official_feedbacks
    GROUP BY post_id, post_type
     ) AS a
GROUP BY post_id, post_type, feedback_type;