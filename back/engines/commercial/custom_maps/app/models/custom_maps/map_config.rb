# == Schema Information
#
# Table name: maps_map_configs
#
#  id            :uuid             not null, primary key
#  project_id    :uuid             not null
#  center        :geography        point, 4326
#  zoom_level    :decimal(4, 2)
#  tile_provider :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_maps_map_configs_on_project_id  (project_id) UNIQUE
#
module CustomMaps
  class MapConfig < ApplicationRecord
    self.table_name = 'maps_map_configs'

    belongs_to :project
    has_many :layers, -> { order(:ordering) }, class_name: 'CustomMaps::Layer', dependent: :destroy
    has_many :legend_items, -> { order(:ordering) }, class_name: 'CustomMaps::LegendItem', dependent: :destroy

    validates :zoom_level, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 20 }, allow_nil: true
    validates :tile_provider, format: { with: %r{\Ahttps://.+\z} }, allow_nil: true
    validates :project_id, presence: true, uniqueness: true

    def center_geojson
      RGeo::GeoJSON.encode(center) if center.present?
    end

    def center_geojson=(geojson)
      self.center = RGeo::GeoJSON.decode(geojson)
    end
  end
end
