# frozen_string_literal: true

FACEBOOK_SETUP_PROC = lambda do |env|
  OmniauthMethods::Facebook.new.omniauth_setup(AppConfiguration.instance, env)
end

GOOGLE_SETUP_PROC = lambda do |env|
  OmniauthMethods::Google.new.omniauth_setup(AppConfiguration.instance, env)
end

# AZURE_AD_SETUP_PROC = lambda do |env|
#   OmniauthMethods::AzureActiveDirectory.new.omniauth_setup(AppConfiguration.instance, env)
# end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, setup: FACEBOOK_SETUP_PROC
  provider :google_oauth2, setup: GOOGLE_SETUP_PROC, name: 'google'
  provider :azure_activedirectory, setup: AZURE_AD_SETUP_PROC
end

OmniAuth.config.full_host = lambda { |_env|
  AppConfiguration.instance&.base_backend_uri
}

# See https://github.com/omniauth/omniauth/wiki/Resolving-CVE-2015-9284
OmniAuth.config.allowed_request_methods = %i[post get]

module OpenIDConnectPatch
  # Patch +OmniAuth::Strategies::OpenIDConnect+ to allow dynamic specification of the issuer.
  def issuer
    return options.issuer.call(env) if options.issuer.respond_to?(:call)

    super
  end
end

OmniAuth::Strategies::OpenIDConnect.prepend(OpenIDConnectPatch)
