module Moderation
  class Engine < ::Rails::Engine
    isolate_namespace Moderation

    config.to_prepare do
      require 'custom_statuses/feature_specification'
      AppConfiguration::Settings.add_feature(Moderation::FeatureSpecification)
    end
  end
end
