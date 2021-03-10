module CustomMaps
  class Engine < ::Rails::Engine
    isolate_namespace CustomMaps

    config.to_prepare do
      require 'custom_maps/feature_specification'
      AppConfiguration::Settings.add_feature(CustomMaps::FeatureSpecification)
    end
  end
end
