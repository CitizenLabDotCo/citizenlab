# frozen_string_literal: true

# This migration comes from analytics (originally 20221102152509)

class CreateFactProjectStatusesView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_project_statuses
  end
end
