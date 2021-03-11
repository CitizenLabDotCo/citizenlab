# frozen_string_literal: true

module GranularPermissions
  class Engine < ::Rails::Engine
    # isolate_namespace GranularPermissions
    config.generators.api_only = true

    def self.register_feature
      require 'granular_permissions/feature_specification'
      AppConfiguration::Settings.add_feature(GranularPermissions::FeatureSpecification)
    end

    def self.register_permission_scopes
      require 'citizen_lab/permissions/scope_types/project'
      require 'citizen_lab/permissions/scope_types/phase'
      PermissionsService.register_scope_type(CitizenLab::Permissions::ScopeTypes::Project)
      PermissionsService.register_scope_type(CitizenLab::Permissions::ScopeTypes::Phase)
    end

    config.to_prepare do
      GranularPermissions::Engine.register_feature
      GranularPermissions::Engine.register_permission_scopes
    end
  end
end
