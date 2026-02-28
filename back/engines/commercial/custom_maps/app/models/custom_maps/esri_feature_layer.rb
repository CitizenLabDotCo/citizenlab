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
#  type            :string
#  layer_url       :string
#  deleted_at      :datetime
#
# Indexes
#
#  index_maps_layers_on_deleted_at     (deleted_at)
#  index_maps_layers_on_map_config_id  (map_config_id)
#
# Foreign Keys
#
#  fk_rails_...  (map_config_id => maps_map_configs.id)
#
module CustomMaps
  class EsriFeatureLayer < Layer
    validates :layer_url,
      presence: true,
      format: { with: %r{\Ahttp(s)?://.+\z}, message: 'should start with http:// or https://' } # rubocop:disable Rails/I18nLocaleTexts
  end
end
