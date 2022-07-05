# frozen_string_literal: true

class AlterDimensionDates < ActiveRecord::Migration[6.1]
  def change

    # Drop the fact views that rely on date dimension
    drop_view :analytics_fact_posts, materialized: true
    drop_view :analytics_fact_participations, materialized: true

    # Now recreate the date dimension
    drop_table :analytics_dimension_dates
    create_table :analytics_dimension_dates, id: false do |t|
      t.date :date, primary_key: true
      t.string :year
      t.string :month
      t.string :day
    end

    # Insert a series of dates - starting at the first activity for this tenant
    execute("
      INSERT INTO analytics_dimension_dates (date, year, month, day)
      WITH dates AS (SELECT MIN(created_at)::DATE AS earliest FROM activities)
      SELECT
          date,
          TO_CHAR(date, 'yyyy') AS year,
          TO_CHAR(date, 'mm') AS month,
          TO_CHAR(date, 'dd') AS day
      FROM (
               SELECT generate_series(
                              (SELECT earliest FROM dates),
                              (date '2022-12-31'),
                              interval '1 day'
                          ) AS date
           ) a;
    ");

    # Recreate the fact views
    create_view :analytics_fact_posts, version: 2, materialized: true

    add_index :analytics_fact_posts, :id
    add_index :analytics_fact_posts, :project_id
    add_index :analytics_fact_posts, :created_date

    create_view :analytics_fact_participations, version: 2, materialized: true

    add_index :analytics_fact_participations, :id
    add_index :analytics_fact_participations, :project_id
    add_index :analytics_fact_participations, :created_date

  end

end
