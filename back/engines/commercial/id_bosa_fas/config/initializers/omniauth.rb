# frozen_string_literal: true

BOSA_FAS_SETUP_PROC = lambda do |env|
  IdBosaFas::BosaFasOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: BOSA_FAS_SETUP_PROC, name: 'bosa_fas'
end
