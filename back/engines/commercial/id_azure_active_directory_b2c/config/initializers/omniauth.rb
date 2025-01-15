# frozen_string_literal: true

AZURE_AD_B2C_SETUP_PROC = lambda do |env|
  IdAzureActiveDirectoryB2c::AzureActiveDirectoryB2cOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: AZURE_AD_B2C_SETUP_PROC, name: 'azureactivedirectory_b2c'
end
