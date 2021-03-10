module GranularPermissions
  class Engine < ::Rails::Engine
    isolate_namespace GranularPermissions
    config.generators.api_only = true

    config.to_prepare do
      require 'granular_permissions/feature_specification'
      AppConfiguration::Settings.add_feature(GranularPermissions::FeatureSpecification)
    end
  end
end
