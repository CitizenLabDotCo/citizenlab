module CustomStatuses
  class Engine < ::Rails::Engine
    isolate_namespace CustomStatuses

    config.to_prepare do
      require 'custom_statuses/feature_specification'
      AppConfiguration::Settings.add_feature(CustomStatuses::FeatureSpecification)
    end
  end
end
