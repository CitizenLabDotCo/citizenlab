# frozen_string_literal: true

require 'factory_bot_rails'

module Analytics
  class Engine < ::Rails::Engine
    isolate_namespace Analytics

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'analytics/feature_specification'
      AppConfiguration::Settings.add_feature(Analytics::FeatureSpecification)
    end
  end
end
