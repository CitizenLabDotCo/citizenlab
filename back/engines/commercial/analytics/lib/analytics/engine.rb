module Analytics
  class Engine < ::Rails::Engine
    isolate_namespace Analytics

    config.to_prepare do
      require 'analytics/feature_specification'
      AppConfiguration::Settings.add_feature(Analytics::FeatureSpecification)
    end

  end
end
