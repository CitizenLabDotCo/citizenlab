
# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module UserConfirmation
  class Engine < ::Rails::Engine
    isolate_namespace UserConfirmation

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'user_confirmation/feature_specification'
      AppConfiguration::Settings.add_feature(UserConfirmation::FeatureSpecification)
    end
  end
end
