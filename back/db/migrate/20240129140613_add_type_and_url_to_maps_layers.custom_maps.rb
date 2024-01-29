# frozen_string_literal: true

# This migration comes from custom_maps (originally 20240125113316)
class AddTypeAndUrlToMapsLayers < ActiveRecord::Migration[7.0]
  def change
    add_column :maps_layers, :layer_type, :string, null: false, default: 'geojson'
    add_column :maps_layers, :layer_url, :string
    change_column_default :maps_layers, :geojson, {}
  end
end
