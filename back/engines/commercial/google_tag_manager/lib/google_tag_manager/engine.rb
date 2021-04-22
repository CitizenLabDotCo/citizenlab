module GoogleTagManager
  class Engine < ::Rails::Engine
    isolate_namespace GoogleTagManager

    config.to_prepare do
      require 'google_tag_manager/feature_specification'
      AppConfiguration::Settings.add_feature(GoogleTagManager::FeatureSpecification)
    end
  end
end
