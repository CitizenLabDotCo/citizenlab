# frozen_string_literal: true

class CreateDimensionDates < ActiveRecord::Migration[6.1]
  def up
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
    ")
  end

  def down
    drop_table :analytics_dimension_dates
  end
end
