# frozen_string_literal: true

require 'project_folders/monkey_patches/user_policy'
require 'project_folders/monkey_patches/project_policy'
require 'project_folders/monkey_patches/project_serializer'
require 'project_folders/monkey_patches/admin_publication_policy'
require 'project_folders/monkey_patches/frontend/url_service'

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
      ::User.prepend(ProjectFolders::UserDecorator)
      ::Frontend::UrlService.include(ProjectFolders::Extensions::Frontend::UrlService)

      if defined? ::EmailCampaigns
        ::EmailCampaigns::DeliveryService.add_campaign_types(
          ::ProjectFolders::EmailCampaigns::Campaigns::ProjectFolderModerationRightsReceived
        )
      end
    end

    ActiveSupport.on_load(:action_controller) do
      ::ProjectPolicy.prepend(ProjectFolders::MonkeyPatches::ProjectPolicy)
      ::UserPolicy.prepend(ProjectFolders::MonkeyPatches::UserPolicy)
      ::AdminPublicationPolicy.prepend(ProjectFolders::MonkeyPatches::AdminPublicationPolicy)
      ::ProjectPolicy::Scope.prepend(ProjectFolders::MonkeyPatches::ProjectPolicy::Scope)
      ::WebApi::V1::ProjectSerializer.include(ProjectFolders::Extensions::ProjectSerializer)
    end
  end
end
