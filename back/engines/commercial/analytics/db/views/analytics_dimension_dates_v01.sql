-- New date dimension view (nearly)
SELECT
    date(full_date) AS date,
    TO_CHAR(full_date, 'YYYY') AS year,
    TO_CHAR(full_date, 'YYYY-MM') AS month,
    date_trunc('week', full_date)::date AS week
from generate_series(
             '2021-01-01',
             CURRENT_DATE,
             INTERVAL '1 day'
         ) as full_date;