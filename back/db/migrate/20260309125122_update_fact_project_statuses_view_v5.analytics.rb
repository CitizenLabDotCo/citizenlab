# frozen_string_literal: true

# This migration comes from analytics (originally 20260309120100)
class UpdateFactProjectStatusesViewV5 < ActiveRecord::Migration[7.2]
  def change
    update_view :analytics_fact_project_statuses, version: 5, revert_to_version: 4
  end
end
