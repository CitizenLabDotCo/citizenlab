# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException
module Texting
  class Engine < ::Rails::Engine
    isolate_namespace Texting

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'texting/feature_specification'
      AppConfiguration::Settings.add_feature(Texting::FeatureSpecification)
    end
  end
end
