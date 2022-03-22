module ContentBuilder
  class Engine < ::Rails::Engine
    isolate_namespace ContentBuilder

    config.to_prepare do
      require 'content_builder/feature_specification'
      AppConfiguration::Settings.add_feature ::ContentBuilder::FeatureSpecification
    end
  end
end
