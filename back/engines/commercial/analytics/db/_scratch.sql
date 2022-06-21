-- Scratch SQL file for analytics
-- To prove that there is a lot in common between each query and potentially these queries can probably all share a lot of code

-- CL-986 As a moderator I want to see how many posts have received feedback so that...
SELECT
    COUNT(*)
FROM analytics_fact_activities afa
INNER JOIN analytics_dimension_projects adp
    ON afa.project_id = adp.id
    AND afa.project_id = '99eeb8e0-ca13-41db-90a9-556843f528b4'
WHERE
    activity_type IN ('idea','initiative') AND
    feedback_recieved_at IS NOT NULL;

-- CL-987 As a moderator I want to see, of the posts that have received feedback, what is the average response time?
SELECT
    SUM(NULLIF(time_to_feedback, 0))
FROM analytics_fact_activities afa
INNER JOIN analytics_dimension_projects adp
    ON afa.project_id = adp.id
    AND afa.project_id = '99eeb8e0-ca13-41db-90a9-556843f528b4'
WHERE
    activity_type IN ('idea','initiative') AND
    feedback_recieved_at IS NOT NULL;

-- CL-988 As a moderator I want to see the total number of posts, comments, or votes in project X between date A and date B?
-- Grouped by month here as an example
SELECT
    add.month,
    COUNT(*)
FROM analytics_fact_activities afa
INNER JOIN analytics_dimension_dates add
    ON add.id = afa.created_date_id
    AND add.date BETWEEN '2020-01-01' AND '2022-06-01'
WHERE
    project_id = '99eeb8e0-ca13-41db-90a9-556843f528b4' AND
    activity_type IN ('idea','initiative')
GROUP BY add.month;

-- CL-989 As a moderator I want to see what were the X posts or comments with the most votes in project X?
SELECT
    add.month,
    COUNT(*)
FROM analytics_fact_activities afa
         INNER JOIN analytics_dimension_dates add
                    ON add.id = afa.created_date_id
                        AND add.date BETWEEN '2020-01-01' AND '2022-06-01'
WHERE
        project_id = '99eeb8e0-ca13-41db-90a9-556843f528b4' AND
        activity_type IN ('idea','initiative')
GROUP BY add.month;