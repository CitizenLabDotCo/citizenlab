module Matomo
  class Engine < ::Rails::Engine
    isolate_namespace Matomo

    config.to_prepare do
      require 'matomo/feature_specification'
      AppConfiguration::Settings.add_feature(Matomo::FeatureSpecification)
    end
  end
end
