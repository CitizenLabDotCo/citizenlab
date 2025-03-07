SELECT
    post_id,
    MIN(feedback_first_date) AS feedback_first_date,
    MAX(feedback_official) AS feedback_official,
    MAX(feedback_status_change) AS feedback_status_change
FROM (
    SELECT
        item_id AS post_id,
        MIN(created_at) AS feedback_first_date,
        0 AS feedback_official,
        1 AS feedback_status_change
    FROM activities
    WHERE
        action = 'changed_status' AND
        item_type = 'Idea'
    GROUP BY item_id

    UNION ALL

    SELECT
        idea_id AS post_id,
        MIN(created_at) AS feedback_first_date,
        1 AS feedback_official,
        0 AS feedback_status_change
    FROM official_feedbacks
    GROUP BY post_id
     ) AS a
GROUP BY post_id;
