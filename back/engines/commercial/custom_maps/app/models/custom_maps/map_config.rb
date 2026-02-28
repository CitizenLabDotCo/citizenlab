# frozen_string_literal: true

# == Schema Information
#
# Table name: maps_map_configs
#
#  id               :uuid             not null, primary key
#  center           :geography        point, 4326
#  zoom_level       :decimal(4, 2)
#  tile_provider    :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  esri_web_map_id  :string
#  esri_base_map_id :string
#  mappable_type    :string
#  mappable_id      :uuid
#  deleted_at       :datetime
#
# Indexes
#
#  index_maps_map_configs_on_deleted_at   (deleted_at)
#  index_maps_map_configs_on_mappable     (mappable_type,mappable_id)
#  index_maps_map_configs_on_mappable_id  (mappable_id) UNIQUE WHERE (deleted_at IS NULL)
#
module CustomMaps
  class MapConfig < ApplicationRecord
    acts_as_paranoid
    self.table_name = 'maps_map_configs'

    belongs_to :mappable, polymorphic: true, optional: true
    has_many :layers, -> { order(:ordering) }, class_name: 'CustomMaps::Layer', dependent: :destroy

    validates :zoom_level, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 20 }, allow_nil: true
    validates :tile_provider, format: { with: %r{\Ahttps://.+\z} }, allow_nil: true
    validates :mappable_id, uniqueness: { conditions: -> { where(deleted_at: nil) } }, allow_nil: true
    validates :mappable, presence: true, if: -> { mappable_id.present? or mappable_type.present? }
    validate :mappable_custom_field_supports_map_config

    def mappable_custom_field_supports_map_config
      return unless mappable_type == 'CustomField' && !mappable.supports_map_config?

      errors.add(:mappable, message: 'The custom field input_type cannot be related to a map_config')
    end

    def center_geojson
      RGeo::GeoJSON.encode(center) if center.present?
    end

    def center_geojson=(geojson)
      self.center = RGeo::GeoJSON.decode(geojson)
    end

    def project_id
      return nil unless mappable_type == 'Project'

      mappable&.id
    end
  end
end
