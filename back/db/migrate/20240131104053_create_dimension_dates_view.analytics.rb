# frozen_string_literal: true

# This migration comes from analytics (originally 20240131103445)
class CreateDimensionDatesView < ActiveRecord::Migration[7.0]
  def change
    drop_table :analytics_dimension_dates
    create_view :analytics_dimension_dates
  end
end
