# frozen_string_literal: true

module IdAzureActiveDirectoryB2c
  class Engine < ::Rails::Engine
    isolate_namespace IdAzureActiveDirectoryB2c

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdAzureActiveDirectoryB2c::FeatureSpecification)
      IdMethod.add_method('azureactivedirectory_b2c', AzureActiveDirectoryB2cOmniauth.new)
    end
  end
end
