module Navbar
  class Engine < ::Rails::Engine
    isolate_namespace Navbar

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'navbar/feature_specification'
      AppConfiguration::Settings.add_feature ::Navbar::FeatureSpecification
    end
  end
end
