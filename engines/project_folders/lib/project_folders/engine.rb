require 'project_folders/monkey_patches/project_policy'
require 'project_folders/monkey_patches/side_fx_project_service'

begin
  require 'factory_bot_rails'
rescue LoadError
end


module ProjectFolders
  class Engine < ::Rails::Engine
    isolate_namespace ProjectFolders
    config.generators.api_only = true

    # Sharing the factories to make them accessible from to the main app / other engines.
    factories_path = File.expand_path('../../../spec/factories', __FILE__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    def self.activate
      # ::File otherwise it picks up ProjectFolders::File
      Dir.glob(::File.join(::File.dirname(__FILE__), '../../app/**/*_decorator*.rb')) do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    config.to_prepare(&method(:activate).to_proc)

    ActiveSupport.on_load(:action_controller) do
      ::User.prepend ProjectFolders::ModeratorDecorator
      ::ProjectPolicy.prepend MonkeyPatches::ProjectPolicy
      ::SideFxProjectService.prepend MonkeyPatches::SideFxProjectService

      ::Roles.configure do |c|
        c.serializers = {
          users: {
            class: ::WebApi::V1::UserSerializer,
            includes: %i[unread_notifications]
          }
        }

        c.subscribers = {
          users: {
            project_folder_moderator: ::ProjectFolders::SideFxModeratorService.new
          }
        }

        c.policies = {
          users: {
            project_folder_moderator: ::ProjectFolders::ModeratorPolicy
          }
        }
      end
    end
  end
end
