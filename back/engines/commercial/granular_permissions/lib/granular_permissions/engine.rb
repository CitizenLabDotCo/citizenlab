# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module GranularPermissions
  class Engine < ::Rails::Engine
    config.generators.api_only = true

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    def self.register_feature
      require 'granular_permissions/feature_specification'
      AppConfiguration::Settings.add_feature(GranularPermissions::FeatureSpecification)
    end

    def self.register_permission_scopes
      require 'citizen_lab/permissions/scope_types/project'
      require 'citizen_lab/permissions/scope_types/phase'
      require 'citizen_lab/permissions/scope_types/global'
      PermissionsService.register_scope_type(CitizenLab::Permissions::ScopeTypes::Project)
      PermissionsService.register_scope_type(CitizenLab::Permissions::ScopeTypes::Phase)
      PermissionsService.register_scope_type(CitizenLab::Permissions::ScopeTypes::Global)
    end

    config.to_prepare do
      GranularPermissions::Engine.register_feature
      GranularPermissions::Engine.register_permission_scopes
    end
  end
end
