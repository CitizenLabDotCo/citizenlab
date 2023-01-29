# frozen_string_literal: true

class CreateFactProjectStatusesView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_project_statuses
  end
end
