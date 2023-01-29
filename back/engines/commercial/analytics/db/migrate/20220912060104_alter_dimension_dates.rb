# frozen_string_literal: true

class AlterDimensionDates < ActiveRecord::Migration[6.1]
  def change
    change_table :analytics_dimension_dates do |t|
      t.remove :day
      t.date :week
    end
    Analytics::DimensionDate.delete_all
  end
end
