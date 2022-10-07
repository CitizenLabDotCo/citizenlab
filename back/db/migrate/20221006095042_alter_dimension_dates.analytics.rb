# frozen_string_literal: true

# This migration comes from analytics (originally 20220912060104)

class AlterDimensionDates < ActiveRecord::Migration[6.1]
  def change
    change_table :analytics_dimension_dates do |t|
      t.remove :day
      t.date :week
    end
    Analytics::DimensionDate.delete_all
  end
end
