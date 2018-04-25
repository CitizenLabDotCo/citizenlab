class AddIdToAreasProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :areas_projects, :id, :uuid, default: "uuid_generate_v4()", null: false, primary_key: true
  end
end
