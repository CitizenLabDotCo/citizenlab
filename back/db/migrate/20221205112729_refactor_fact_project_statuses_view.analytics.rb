# frozen_string_literal: true

# This migration comes from analytics (originally 20221205110616)

class RefactorFactProjectStatusesView < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_project_statuses, version: 3, revert_to_version: 2
  end
end
