# frozen_string_literal: true

# This migration comes from analytics (originally 20220624100304)

class CreateDimensionStatuses < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_dimension_statuses
  end
end
