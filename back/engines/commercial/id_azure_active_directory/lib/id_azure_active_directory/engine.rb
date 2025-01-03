# frozen_string_literal: true

module IdAzureActiveDirectory
  class Engine < ::Rails::Engine
    isolate_namespace IdAzureActiveDirectory

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdAzureActiveDirectory::FeatureSpecification)
      IdMethod.add_method('azureactivedirectory', AzureActiveDirectoryOmniauth.new)
    end
  end
end
