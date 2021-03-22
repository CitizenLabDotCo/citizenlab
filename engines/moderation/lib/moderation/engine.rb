module Moderation
  class Engine < ::Rails::Engine
    isolate_namespace Moderation

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'moderation/feature_specification'
      AppConfiguration::Settings.add_feature ::Moderation::FeatureSpecification
    end
  end
end
