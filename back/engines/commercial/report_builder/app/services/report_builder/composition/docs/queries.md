# Query patterns over the reporting views

The views and their columns are in the prompt under "The reporting views"; this is how
they are usually put together. Every query is one SELECT, over the views named
unqualified, with no `now()` and no parameter: it is stored with the chart and must give
the same answer tomorrow. Aggregate in SQL and alias every column to the key the chart
reads. At most 1000 rows come back, and a chart wants tens.

Scope to the project: `WHERE project_id = '<the project id from the context>'`. The id is
a literal in the query, not a config value — config cannot change what a chart reads.

## Who took part, and how much

Participants are people, contributions are things they did. Count people with
`COUNT(DISTINCT participant_id)`; `participant_id` is filled in for anonymous
contributions too, so it never undercounts.

```sql
SELECT type AS label, COUNT(*) AS count
FROM reporting_contributions
WHERE project_id = '...'
GROUP BY type
ORDER BY count DESC
```

```sql
SELECT COUNT(DISTINCT participant_id) AS participants, COUNT(*) AS contributions
FROM reporting_contributions
WHERE project_id = '...'
```

## Over time

Truncate in SQL and format the label in SQL, so the axis needs no formatter in the
block. Order by the real date, not the label.

```sql
SELECT to_char(date_trunc('month', contributed_at), 'Mon YYYY') AS month,
       COUNT(DISTINCT participant_id) AS participants
FROM reporting_contributions
WHERE project_id = '...'
GROUP BY date_trunc('month', contributed_at)
ORDER BY date_trunc('month', contributed_at)
```

Use `week` for a project shorter than three months, `month` otherwise. A series with one
point is a number, not a chart.

## Per phase

`phase_id` on a contribution is the phase it belongs to. Join `reporting_phases` for the
title and the order; the phase ids and titles are also listed in the project context, so a
short list can be written as a CASE on `phase_id` without the join.

```sql
SELECT p.title AS label, COUNT(DISTINCT c.participant_id) AS participants
FROM reporting_contributions c
JOIN reporting_phases p ON p.id = c.phase_id
WHERE c.project_id = '...'
GROUP BY p.id, p.title, p.start_at
ORDER BY p.start_at
```

## What people chose or answered

Votes and survey answers each have their own view. A survey answer row is one input's
answer to one question: `selected` holds the option chosen, `value_text` and
`value_numeric` a free answer, and `input_id` is the input it belongs to, which is how
it is scoped to a project. The question ids are in the project context. Rank by count,
keep the top ten for a bar chart with a readable axis, and compute a share in SQL when
the chart shows one.

```sql
SELECT label, count, ROUND(100.0 * count / SUM(count) OVER (), 0) AS share
FROM (
  SELECT a.selected AS label, COUNT(*) AS count
  FROM reporting_input_question_answers a
  JOIN reporting_inputs i ON i.id = a.input_id
  WHERE i.project_id = '...' AND a.question_id = '...'
  GROUP BY a.selected
) answers
ORDER BY count DESC
LIMIT 10
```

Column names above are the common ones; the schema section of the prompt is the
authority when they differ.

For an ordered scale (1 to 5, agree to disagree) do not order by count: `ORDER BY` the
scale value, and keep every step even when its count is zero.

## Visitors

Sessions and pageviews are visits, not people. A visitor count is `COUNT(DISTINCT ...)`
over sessions; a traffic source breakdown groups sessions by their referrer type.

## When a query returns nothing

An empty result is a chart that draws nothing, and the check will say so. Before
authoring, run the query with run_reporting_sql_query and look at the rows. If a section
has no data behind it, leave the section out rather than chart an empty frame.
