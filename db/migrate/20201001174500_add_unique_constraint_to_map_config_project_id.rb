class AddUniqueConstraintToMapConfigProjectId < ActiveRecord::Migration[6.0]
  def change
    remove_index :maps_map_configs, :project_id
    add_index :maps_map_configs, :project_id, unique: true
  end
end
