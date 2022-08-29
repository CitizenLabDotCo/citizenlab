# frozen_string_literal: true

class CreateDimensionDates < ActiveRecord::Migration[6.1]
  def up
    create_table :analytics_dimension_dates, id: false do |t|
      t.date :date, primary_key: true
      t.string :year
      t.string :month
      t.string :day
    end
  end

  def down
    drop_table :analytics_dimension_dates
  end
end
