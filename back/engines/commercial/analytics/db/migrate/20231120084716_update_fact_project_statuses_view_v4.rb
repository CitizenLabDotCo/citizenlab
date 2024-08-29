# frozen_string_literal: true

class UpdateFactProjectStatusesViewV4 < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_project_statuses, version: 4, revert_to_version: 3
  end
end
