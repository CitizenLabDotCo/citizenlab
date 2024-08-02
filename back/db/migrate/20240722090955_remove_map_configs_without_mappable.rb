# frozen_string_literal: true

# This is a data migration. It does not change the schema.
class RemoveMapConfigsWithoutMappable < ActiveRecord::Migration[7.0]
  class MapConfig < ApplicationRecord
    self.table_name = 'maps_map_configs'
  end

  class Layer < ApplicationRecord
    self.table_name = 'maps_layers'

    belongs_to :map_config, class_name: 'MapConfig'
  end

  def change
    map_configs = MapConfig.where(mappable_id: nil, mappable_type: nil)
    layers = Layer.where(map_config: map_configs)

    layers.delete_all
    map_configs.delete_all
  end
end
