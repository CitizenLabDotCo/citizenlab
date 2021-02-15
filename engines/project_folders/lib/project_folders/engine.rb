# frozen_string_literal: true

# monkey patches
require 'project_folders/monkey_patches/user'
require 'project_folders/monkey_patches/user_policy'
require 'project_folders/monkey_patches/project_policy'
require 'project_folders/monkey_patches/admin_publication_policy'

# extensions
require 'project_folders/extensions/user'
require 'project_folders/extensions/project'
require 'project_folders/extensions/project_serializer'
require 'project_folders/extensions/frontend/url_service'

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

    config.after_initialize do
      # adds folder moderation rights methods to users.
      ::User.include(ProjectFolders::Extensions::User)

      # overrides the roles validation json, and patches the user highest_role method.
      ::User.prepend(ProjectFolders::MonkeyPatches::User)

      # adds lifecycle methods to projects that check up on whether it is contained in a folder or not,
      # to automatically set folder admins.
      ::Project.include(ProjectFolders::Extensions::Project)

      # adds a model to url method for folders.
      ::Frontend::UrlService.include(ProjectFolders::Extensions::Frontend::UrlService)

      # adds a the moderation rights received email campaign to the list in the DeliveryService
      if defined? ::EmailCampaigns
        ::EmailCampaigns::DeliveryService.add_campaign_types(
          ::ProjectFolders::EmailCampaigns::Campaigns::ProjectFolderModerationRightsReceived
        )
      end
    end

    ActiveSupport.on_load(:action_controller) do
      # changes the project policy to give special rights to folder moderators.
      ::ProjectPolicy.prepend(ProjectFolders::MonkeyPatches::ProjectPolicy)
      ::ProjectPolicy::Scope.prepend(ProjectFolders::MonkeyPatches::ProjectPolicy::Scope)

      # changes the user policy to allow folder_id in the user role params.
      ::UserPolicy.prepend(ProjectFolders::MonkeyPatches::UserPolicy)

      # changes the admin publication policy to allow folder moderators to reorder their projects.
      ::AdminPublicationPolicy.prepend(ProjectFolders::MonkeyPatches::AdminPublicationPolicy)

      # adds folder_id to the serialized project.
      ::WebApi::V1::ProjectSerializer.include(ProjectFolders::Extensions::ProjectSerializer)
    end
  end
end
