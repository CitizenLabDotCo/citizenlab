# frozen_string_literal: true

FAKE_SSO_SETUP_PROC = lambda do |env|
  IdFakeSso::FakeSsoOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: FAKE_SSO_SETUP_PROC, name: 'fake_sso', issuer: IdFakeSso::FakeSsoOmniauth.new.method(:issuer)
end
