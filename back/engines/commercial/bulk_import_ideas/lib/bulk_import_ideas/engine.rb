# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module BulkImportIdeas
  class Engine < ::Rails::Engine
    isolate_namespace BulkImportIdeas

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'bulk_import_ideas/feature_specification'
      AppConfiguration::Settings.add_feature ::BulkImportIdeas::FeatureSpecification
    end

    initializer 'bulk_import_ideas.add_view_paths' do |app|
      # Add views for HTML/PDF generation to the view search paths
      app.config.paths['app/views'].unshift(root.join('app/views').to_s)
    end
  end
end
