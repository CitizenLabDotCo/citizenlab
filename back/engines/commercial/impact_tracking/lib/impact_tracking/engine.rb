# frozen_string_literal: true

module ImpactTracking
  class Engine < ::Rails::Engine
    isolate_namespace ImpactTracking

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)
  end
end
