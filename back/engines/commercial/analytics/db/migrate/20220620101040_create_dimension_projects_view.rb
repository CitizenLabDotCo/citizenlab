class CreateDimensionProjectsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_dimension_projects, materialized: true

  end
end
