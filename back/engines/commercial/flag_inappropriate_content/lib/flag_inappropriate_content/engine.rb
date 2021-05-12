module FlagInappropriateContent
  class Engine < ::Rails::Engine
    isolate_namespace FlagInappropriateContent

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'flag_inappropriate_content/feature_specification'
      AppConfiguration::Settings.add_feature ::FlagInappropriateContent::FeatureSpecification
    end
  end
end
