# frozen_string_literal: true

class CreateDimensionDates < ActiveRecord::Migration[6.1]
  def up

    create_table :analytics_dimension_dates, id: :uuid do |t|
      t.date :date
      t.string :year
      t.string :month
      t.string :day
    end

    # Insert a series of dates
    execute("
      INSERT INTO analytics_dimension_dates (date, year, month, day)
      SELECT
        date,
        TO_CHAR(date, 'yyyy') AS year,
        TO_CHAR(date, 'mm') AS month,
        TO_CHAR(date, 'dd') AS day
      FROM (
        SELECT generate_series(
          (date '2022-01-01'),
          (date '2022-12-31'),
          interval '1 day'
        ) AS date
      ) a;
    ");

  end

  def down
    drop_table :analytics_dimension_dates
  end

end
