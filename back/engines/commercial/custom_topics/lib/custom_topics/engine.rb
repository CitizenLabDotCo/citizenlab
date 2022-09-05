# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module CustomTopics
  class Engine < ::Rails::Engine
    isolate_namespace CustomTopics

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'custom_topics/feature_specification'
      AppConfiguration::Settings.add_feature(CustomTopics::FeatureSpecification)
    end
  end
end
