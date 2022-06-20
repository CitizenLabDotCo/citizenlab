class CreateDimensionDates < ActiveRecord::Migration[6.1]
  def up
    #ActiveRecord::Base.establish_connection("development_analytics")

    create_table :dimension_dates do |t|
      t.date :date
      t.string :year
      t.string :month
      t.string :day
    end

    # Insert a series of dates
    execute("
      INSERT INTO dimension_dates (date, year, month, day)
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

    #ActiveRecord::Base.establish_connection(Rails.env)
  end

  def down
    drop_table :dimension_dates
  end

end
