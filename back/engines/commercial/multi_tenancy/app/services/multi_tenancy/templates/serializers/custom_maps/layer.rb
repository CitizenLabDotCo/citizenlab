# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module CustomMaps
        class Layer < Base
          ref_attribute :map_config
          attributes %i[type layer_url default_enabled geojson marker_svg_url title_multiloc ordering]
        end
      end
    end
  end
end
