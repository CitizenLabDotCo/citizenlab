class AddEsriWebMapIdToMapConfigs < ActiveRecord::Migration[7.0]
  def change
    add_column :maps_map_configs, :esri_web_map_id, :string
  end
end
