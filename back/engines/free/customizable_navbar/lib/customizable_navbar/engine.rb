# frozen_string_literal: true

module CustomizableNavbar
  class Engine < ::Rails::Engine
    isolate_namespace CustomizableNavbar

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)
  end
end
