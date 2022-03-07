module Texting
  class Engine < ::Rails::Engine
    isolate_namespace Texting

    config.to_prepare do
      require 'texting/feature_specification'
      AppConfiguration::Settings.add_feature(Texting::FeatureSpecification)
    end
  end
end
