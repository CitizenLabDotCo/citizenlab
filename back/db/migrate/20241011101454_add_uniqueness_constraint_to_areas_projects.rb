class AddUniquenessConstraintToAreasProjects < ActiveRecord::Migration[7.0]
  def change
    add_index :areas_projects, %i[project_id area_id], unique: true
  end
end
