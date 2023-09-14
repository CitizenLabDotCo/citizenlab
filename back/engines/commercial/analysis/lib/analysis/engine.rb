# frozen_string_literal: true

module Analysis
  class Engine < ::Rails::Engine
    isolate_namespace Analysis

    config.to_prepare do
      require 'analysis/feature_specification'
      AppConfiguration::Settings.add_feature(::Analysis::FeatureSpecification)
    end
  end
end
