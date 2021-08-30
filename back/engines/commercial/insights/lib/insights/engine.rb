# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module Insights
  class Engine < ::Rails::Engine
    isolate_namespace Insights
    config.generators.api_only = true

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'insights/feature_specifications/manual_flow'
      require 'insights/feature_specifications/nlp_flow'
      AppConfiguration::Settings.add_feature(Insights::FeatureSpecifications::ManualFlow)
      AppConfiguration::Settings.add_feature(Insights::FeatureSpecifications::NlpFlow)
    end
  end
end
