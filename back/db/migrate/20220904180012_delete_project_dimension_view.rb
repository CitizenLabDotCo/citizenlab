# frozen_string_literal: true

# Delete the project view as the model can just reference the existing project table
class DeleteProjectDimensionView < ActiveRecord::Migration[6.1]
  def change
    drop_view :analytics_dimension_projects
  end
end
