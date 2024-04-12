# frozen_string_literal: true

class AddTypeAndLayerUrlToMapsLayers < ActiveRecord::Migration[7.0]
  # rubocop:disable Rails/ApplicationRecord
  class StubMapsLayer < ActiveRecord::Base
    self.table_name = 'maps_layers'
  end
  # rubocop:enable Rails/ApplicationRecord

  def change
    add_column :maps_layers, :type, :string
    add_column :maps_layers, :layer_url, :string
    change_column_default :maps_layers, :geojson, from: nil, to: {}

    reversible do |dir|
      dir.up do
        StubMapsLayer.update_all(type: 'CustomMaps::GeojsonLayer')
      end
    end
  end
end
