# frozen_string_literal: true

# This migration comes from analytics (originally 20221028092515)

class UpdateDimensionStatusesView < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_dimension_statuses, version: 2, revert_to_version: 1
  end
end
