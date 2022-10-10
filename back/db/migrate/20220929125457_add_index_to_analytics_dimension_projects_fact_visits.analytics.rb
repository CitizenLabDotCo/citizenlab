# frozen_string_literal: true

# This migration comes from analytics (originally 20220929124340)

class AddIndexToAnalyticsDimensionProjectsFactVisits < ActiveRecord::Migration[6.1]
  def change
    add_index(
      :analytics_dimension_projects_fact_visits,
      %i[dimension_project_id fact_visit_id],
      unique: true,
      name: 'i_analytics_dim_projects_fact_visits_on_project_and_visit_ids'
    )
  end
end
