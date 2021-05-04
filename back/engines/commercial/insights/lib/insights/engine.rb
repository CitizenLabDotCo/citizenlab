module Insights
  class Engine < ::Rails::Engine
    isolate_namespace Insights

    config.to_prepare do
      require 'insights/manual_feature_specification'
      AppConfiguration::Settings.add_feature(Insights::ManualFeatureSpecification)
    end
  end
end
