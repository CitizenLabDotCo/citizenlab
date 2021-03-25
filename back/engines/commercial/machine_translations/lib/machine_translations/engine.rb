module MachineTranslations
  class Engine < ::Rails::Engine
    isolate_namespace MachineTranslations

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'machine_translations/feature_specification'
      AppConfiguration::Settings.add_feature ::MachineTranslations::FeatureSpecification
    end
  end
end
