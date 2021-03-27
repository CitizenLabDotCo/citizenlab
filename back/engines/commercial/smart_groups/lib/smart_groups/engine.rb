# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException


module SmartGroups
  class Engine < ::Rails::Engine
    isolate_namespace SmartGroups

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    if Rails.env.development? || Rails.env.test?
      config.autoload_paths << "#{config.root}/lib"
    else
      config.eager_load_paths << "#{config.root}/lib"
    end

    config.to_prepare do
      AppConfiguration::Settings.add_feature(SmartGroups::FeatureSpecification)
    end
  end
end
