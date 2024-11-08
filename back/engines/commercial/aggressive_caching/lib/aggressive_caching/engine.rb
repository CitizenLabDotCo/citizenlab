# frozen_string_literal: true

module AggressiveCaching
  class Engine < ::Rails::Engine
    isolate_namespace AggressiveCaching

    config.to_prepare do
      require 'aggressive_caching/feature_specification'
      AppConfiguration::Settings.add_feature(AggressiveCaching::FeatureSpecification)
    end
  end
end
