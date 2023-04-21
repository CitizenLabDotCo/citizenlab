# frozen_string_literal: true

class CustomMaps::WebApi::V1::LayerSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc,
    :geojson,
    :default_enabled,
    :marker_svg_url,
    :ordering,
    :id
end
