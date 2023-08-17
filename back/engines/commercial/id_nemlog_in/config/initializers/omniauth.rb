# frozen_string_literal: true

NEMLOG_IN_SAML_SETUP_PROC = lambda do |env|
  omniauth = IdNemlogIn::NemlogInOmniauth.new
  omniauth.replace_token_param!(env)
  omniauth.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: NEMLOG_IN_SAML_SETUP_PROC, name: 'nemlog_in'
end
