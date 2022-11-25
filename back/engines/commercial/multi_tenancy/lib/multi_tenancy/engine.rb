# frozen_string_literal: true

begin
  require 'factory_bot_rails'
rescue LoadError
  # Ignoring
end
module MultiTenancy
  class Engine < ::Rails::Engine
    config.generators.api_only = true

    # Sharing the factories to make them accessible from to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    def self.reload_extensions
      module_paths =  Dir.glob(File.join(::File.dirname(__FILE__), '../../app/**/extensions/**/*.rb'))
      module_paths += Dir.glob(File.join(::File.dirname(__FILE__), '../../app/**/patches/**/*.rb'))
      module_paths.sort.each do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    config.to_prepare do
      MultiTenancy::Engine.reload_extensions
    end
  end
end
