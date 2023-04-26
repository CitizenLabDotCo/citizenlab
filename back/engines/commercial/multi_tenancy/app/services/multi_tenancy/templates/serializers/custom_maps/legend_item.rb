# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module CustomMaps
        class LegendItem < Base
          ref_attribute :map_config
          attributes %i[color ordering title_multiloc]
        end
      end
    end
  end
end
