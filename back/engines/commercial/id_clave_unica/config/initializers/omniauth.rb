# frozen_string_literal: true

CLAVE_UNICA_SETUP_PROC = lambda do |env|
  IdClaveUnica::ClaveUnicaOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: CLAVE_UNICA_SETUP_PROC, name: 'clave_unica', issuer: IdClaveUnica::ClaveUnicaOmniauth.new.method(:issuer)
end
