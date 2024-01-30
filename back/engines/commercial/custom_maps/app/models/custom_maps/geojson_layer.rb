# frozen_string_literal: true

# == Schema Information
#
# Table name: maps_layers
#
#  id              :uuid             not null, primary key
#  map_config_id   :uuid             not null
#  title_multiloc  :jsonb            not null
#  ordering        :integer          not null
#  geojson         :jsonb            not null
#  default_enabled :boolean          default(TRUE), not null
#  marker_svg_url  :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  type            :string           default("CustomMaps::GeojsonLayer"), not null
#  layer_url       :string
#
# Indexes
#
#  index_maps_layers_on_map_config_id  (map_config_id)
#
# Foreign Keys
#
#  fk_rails_...  (map_config_id => maps_map_configs.id)
#
module CustomMaps
  class GeojsonLayer < Layer
    GEOJSON_SCHEMA = CustomMaps::Engine.root.join('config', 'schemas', 'geojson.json_schema').to_s

    validates :geojson, presence: true, json: { schema: GEOJSON_SCHEMA }
  end
end
