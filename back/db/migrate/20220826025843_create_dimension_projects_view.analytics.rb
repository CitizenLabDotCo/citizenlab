# frozen_string_literal: true

# This migration comes from analytics (originally 20220624101040)

class CreateDimensionProjectsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_dimension_projects
  end
end
