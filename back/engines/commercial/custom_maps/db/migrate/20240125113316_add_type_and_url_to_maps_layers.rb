# frozen_string_literal: true

class AddTypeAndUrlToMapsLayers < ActiveRecord::Migration[7.0]
  def change
    add_column :maps_layers, :layer_type, :string, null: false, default: 'geojson'
    add_column :maps_layers, :layer_url, :string
    change_column_null :maps_layers, :geojson, true
  end
end
