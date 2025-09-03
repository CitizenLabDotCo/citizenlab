# frozen_string_literal: true

Rails.application.reloader.to_prepare do
  OmniAuth::Strategies::OpenIDConnect.prepend(GemExtensions::OmniAuth::Strategies::OpenIdConnect)
end

# See https://github.com/omniauth/omniauth/wiki/Resolving-CVE-2015-9284
# TODO: Change all implementations to use POST requests
OmniAuth.config.allowed_request_methods = %i[post get]
OmniAuth.config.silence_get_warning = true

OmniAuth.config.full_host = lambda { |_env|
  AppConfiguration.instance&.base_backend_uri
}

# Configure the HTTP client of the OpenID Connect gem to use the middleware
# that parses responses with a content type of application/jwt.
#
# This resolves the issue where the OpenID Connect gem assumes that the response
# for userinfo is always JSON. However, the OpenID Connect specification
# allows for the response to be a JWT.
# Refer to https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse.
#
# The `jwt` middleware is implemented and registered by the faraday-jwt gem.
OpenIDConnect.http_config do |config|
  config.response :jwt
end

# Register OmniAuth strategies

FACEBOOK_SETUP_PROC = lambda do |env|
  OmniauthMethods::Facebook.new.omniauth_setup(AppConfiguration.instance, env)
end

GOOGLE_SETUP_PROC = lambda do |env|
  OmniauthMethods::Google.new.omniauth_setup(AppConfiguration.instance, env)
end

OmniAuth.config.add_camelization 'azure_activedirectory', 'AzureActiveDirectory'
AZURE_AD_SETUP_PROC = lambda do |env|
  OmniauthMethods::AzureActiveDirectory.new.omniauth_setup(AppConfiguration.instance, env)
end

AZURE_AD_B2C_SETUP_PROC = lambda do |env|
  OmniauthMethods::AzureActiveDirectoryB2c.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, setup: FACEBOOK_SETUP_PROC
  provider :google_oauth2, setup: GOOGLE_SETUP_PROC, name: 'google'
  provider :azure_activedirectory, setup: AZURE_AD_SETUP_PROC
  provider :openid_connect, setup: AZURE_AD_B2C_SETUP_PROC, name: 'azureactivedirectory_b2c'
end
