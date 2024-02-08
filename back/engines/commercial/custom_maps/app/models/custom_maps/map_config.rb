# frozen_string_literal: true

# == Schema Information
#
# Table name: maps_map_configs
#
#  id            :uuid             not null, primary key
#  center        :geography        point, 4326
#  zoom_level    :decimal(4, 2)
#  tile_provider :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  mappable_type :string           not null
#  mappable_id   :uuid             not null
#
# Indexes
#
#  index_maps_map_configs_on_mappable  (mappable_type,mappable_id)
#
module CustomMaps
  class MapConfig < ApplicationRecord
    self.table_name = 'maps_map_configs'

    belongs_to :mappable, polymorphic: true
    has_many :layers, -> { order(:ordering) }, class_name: 'CustomMaps::Layer', dependent: :destroy
    has_many :legend_items, -> { order(:ordering) }, class_name: 'CustomMaps::LegendItem', dependent: :destroy

    validates :zoom_level, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 20 }, allow_nil: true
    validates :tile_provider, format: { with: %r{\Ahttps://.+\z} }, allow_nil: true
    validates :mappable_id, presence: true, uniqueness: true

    def center_geojson
      RGeo::GeoJSON.encode(center) if center.present?
    end

    def center_geojson=(geojson)
      self.center = RGeo::GeoJSON.decode(geojson)
    end

    def project_id
      resource.project_id if resource_type == 'Project'
    end

    def custom_field_id
      resource.custom_field_id if resource_type == 'CustomField'
    end
  end
end
