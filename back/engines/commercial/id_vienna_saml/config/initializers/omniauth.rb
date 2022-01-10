# frozen_string_literal: true

VIENNA_SAML_SETUP_PROC = lambda do |env|
  IdViennaSaml::ViennaSamlOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: VIENNA_SAML_SETUP_PROC
end
