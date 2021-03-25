module CustomTopics
  class Engine < ::Rails::Engine
    isolate_namespace CustomTopics

    config.to_prepare do
      require 'custom_topics/feature_specification'
      AppConfiguration::Settings.add_feature(CustomTopics::FeatureSpecification)
    end
  end
end
