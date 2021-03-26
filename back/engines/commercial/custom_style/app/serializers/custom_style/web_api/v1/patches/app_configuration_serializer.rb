# frozen_string_literal: true

module CustomStyle
  module WebApi::V1
    module Patches
      module AppConfigurationSerializer
        def self.included(base)
          base.class_eval do
            attribute :style, if: proc { |record| record.feature_activated?('custom_style') }
          end
        end
      end
    end
  end
end
