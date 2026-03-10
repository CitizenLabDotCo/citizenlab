# frozen_string_literal: true

FEDERA_SETUP_PROC = lambda do |env|
  IdFedera::FederaOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: FEDERA_SETUP_PROC, name: 'federa'
end
