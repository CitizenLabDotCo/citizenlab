module UserCustomFields
  class Engine < ::Rails::Engine
    isolate_namespace UserCustomFields

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'user_custom_fields/feature_specification'
      AppConfiguration::Settings.add_feature ::UserCustomFields::FeatureSpecification
    end
  end
end
