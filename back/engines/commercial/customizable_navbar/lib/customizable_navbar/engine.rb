module CustomizableNavbar
  class Engine < ::Rails::Engine
    isolate_namespace CustomizableNavbar

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'customizable_navbar/feature_specification'
      AppConfiguration::Settings.add_feature ::CustomizableNavbar::FeatureSpecification
    end
  end
end
