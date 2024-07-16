# This migration comes from custom_maps (originally 20240214125503)
class AddEsriWebMapIdToMapConfigs < ActiveRecord::Migration[7.0]
  def change
    add_column :maps_map_configs, :esri_web_map_id, :string
  end
end
