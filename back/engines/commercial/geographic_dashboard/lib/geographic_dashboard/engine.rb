module GeographicDashboard
  class Engine < ::Rails::Engine
    isolate_namespace GeographicDashboard

    config.to_prepare do
      require 'geographic_dashboard/feature_specification'
      AppConfiguration::Settings.add_feature(GeographicDashboard::FeatureSpecification)
    end
  end
end
