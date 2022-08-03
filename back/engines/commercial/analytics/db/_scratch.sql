-- Scratch SQL file for analytics
-- To prove that there is a lot in common between each query and potentially these queries can probably all share a lot of code

-- CL-986 As a moderator I want to see how many posts have received feedback so that...
-- CL-987 As a moderator I want to see, of the posts that have received feedback, what is the average response time?

SELECT
    COUNT(*) AS count,
    SUM(fp.feedback_none) AS sum_feedback_none,
    SUM(fp.feedback_official) AS sum_feedback_official,
    SUM(fp.feedback_status_change) AS sum_feedback_status_change,
    AVG(fp.feedback_time_taken) AS avg_feedback_time_taken
FROM analytics_fact_posts fp
INNER JOIN analytics_dimension_projects adp
    ON fp.project_id = adp.id
    AND adp.id = '99eeb8e0-ca13-41db-90a9-556843f528b4';

-- CL-989 As a moderator I want to see what were the X posts or comments with the most votes in project X?
-- POST
SELECT
    *
FROM analytics_fact_participations afp
INNER JOIN analytics_dimension_dates add
    ON add.id = afp.created_date_id
    AND add.date BETWEEN '2020-01-01' AND '2022-06-01'
INNER JOIN analytics_dimension_types adt
    ON afp.type_id = adt.id
    AND adt.parent = 'post'
ORDER BY afp.votes_count
LIMIT 3;

-- COMMENT
SELECT
    *
FROM analytics_fact_participations afp
INNER JOIN analytics_dimension_dates add
    ON add.id = afp.created_date_id
    AND add.date BETWEEN '2020-01-01' AND '2022-06-01'
INNER JOIN analytics_dimension_types adt
    ON afp.type_id = adt.id
    AND adt.name = 'comment'
ORDER BY afp.votes_count
LIMIT 3;


-- Dropping all migrations
/*
TRUNCATE TABLE schema_migrations;
DROP MATERIALIZED VIEW IF EXISTS analytics_dimension_projects;
DROP MATERIALIZED VIEW IF EXISTS analytics_fact_activities;
DROP MATERIALIZED VIEW IF EXISTS analytics_fact_posts;
DROP MATERIALIZED VIEW IF EXISTS analytics_fact_participations;
DROP MATERIALIZED VIEW IF EXISTS analytics_build_feedbacks;
DROP TABLE IF EXISTS analytics_dimension_dates;
DROP TABLE IF EXISTS analytics_dimension_types;
*/
