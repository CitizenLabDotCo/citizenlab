# frozen_string_literal: true

OmniAuth.config.add_camelization 'azure_activedirectory', 'AzureActiveDirectory'
AZURE_AD_SETUP_PROC = lambda do |env|
  OmniauthMethods::AzureActiveDirectory.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :azure_activedirectory, setup: AZURE_AD_SETUP_PROC
end
