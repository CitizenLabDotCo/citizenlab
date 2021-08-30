# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module ProjectFolders
  class Engine < ::Rails::Engine
    extend ClassMethods

    isolate_namespace ProjectFolders

    config.generators.api_only = true

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'project_folders/feature_specification'
      AppConfiguration::Settings.add_feature(ProjectFolders::FeatureSpecification)

      # Adding project folders to the sitemap.
      if defined? ::Seo::ApplicationController
        ::Seo::ApplicationController.outlet 'seo.sitemap' do |locals|
          folders = ProjectFolders::Folder
                    .select(
                      :'project_folders_folders.id', :'project_folders_folders.slug',
                      :'project_folders_folders.updated_at', :'admin_publications.publication_status',
                      :'admin_publications.publication_type', :'admin_publications.publication_id'
                    )
                    .includes(:admin_publication).where(admin_publications: { publication_status: %w[published archived] })
          { partial: 'seo/sitemap', locals: { folders: folders, **locals } }
        end
      end
    end
  end
end
