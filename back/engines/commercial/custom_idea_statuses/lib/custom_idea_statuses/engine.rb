module CustomIdeaStatuses
  class Engine < ::Rails::Engine
    isolate_namespace CustomIdeaStatuses

    config.to_prepare do
      require 'custom_idea_statuses/feature_specification'
      AppConfiguration::Settings.add_feature(CustomIdeaStatuses::FeatureSpecification)
    end
  end
end
