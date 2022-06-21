class CreateDimensionProjects < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_dimension_projects
  end
end
