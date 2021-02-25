# frozen_string_literal: true

require 'project_folders/monkey_patches/admin_publication_policy'
require 'project_folders/monkey_patches/project_policy'
require 'project_folders/monkey_patches/project_serializer'
require 'project_folders/monkey_patches/user_policy'

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module ProjectFolders
  class Engine < ::Rails::Engine
    isolate_namespace ProjectFolders

    config.generators.api_only = true

    # Sharing the factories to make them accessible from to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    def self.activate
      # ::File otherwise it picks up ProjectFolders::File
      Dir.glob(::File.join(::File.dirname(__FILE__), '../../app/**/*_decorator*.rb')).sort.each do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    config.to_prepare(&method(:activate).to_proc)
    config.to_prepare do
      require 'project_folders/feature_specification'
      AppConfiguration::Settings.add_feature(ProjectFolders::FeatureSpecification)

      ::User.prepend(ProjectFolders::UserDecorator)
      ::ProjectPolicy.prepend ProjectFolders::MonkeyPatches::ProjectPolicy
      ::UserPolicy.prepend ProjectFolders::MonkeyPatches::UserPolicy
      ::AdminPublicationPolicy.prepend ProjectFolders::MonkeyPatches::AdminPublicationPolicy
      ::ProjectPolicy::Scope.prepend ProjectFolders::MonkeyPatches::ProjectPolicy::Scope
      ::WebApi::V1::ProjectSerializer.prepend ProjectFolders::MonkeyPatches::ProjectSerializer
    end

    config.to_prepare do
      next unless defined? ::Seo::ApplicationController

      ::Seo::ApplicationController.outlet 'seo.sitemap' do |locals|
        folders = ProjectFolders::Folder
                  .select(
                    :'project_folders_folders.id', :'project_folders_folders.slug',
                    :'project_folders_folders.updated_at', :'admin_publications.publication_status',
                    :'admin_publications.publication_type', :'admin_publications.publication_id'
                  )
                  .includes(:admin_publication)
                  .where(admin_publications: { publication_status: %w[published archived] })
        { partial: 'seo/sitemap', locals: { folders: folders, **locals } }
      end
    end
  end
end
