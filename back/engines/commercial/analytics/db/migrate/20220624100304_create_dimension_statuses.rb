# frozen_string_literal: true

class CreateDimensionStatuses < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_dimension_statuses
  end
end
