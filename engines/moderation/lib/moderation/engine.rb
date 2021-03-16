module Moderation
  class Engine < ::Rails::Engine
    isolate_namespace Moderation

    config.to_prepare do
      require 'moderation/feature_specification'
      AppConfiguration::Settings.add_feature FeatureSpecification
    end
  end
end
