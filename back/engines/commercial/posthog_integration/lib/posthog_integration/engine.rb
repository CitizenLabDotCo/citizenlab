# frozen_string_literal: true

module PosthogIntegration
  class Engine < ::Rails::Engine
    isolate_namespace PosthogIntegration

    config.to_prepare do
      require 'posthog_integration/feature_specification'
      AppConfiguration::Settings.add_feature(PosthogIntegration::FeatureSpecification)
    end
  end
end
