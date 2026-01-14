# frozen_string_literal: true

ACM_SETUP_PROC = lambda do |env|
  IdAcm::AcmOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: ACM_SETUP_PROC, name: 'acm', issuer: IdAcm::AcmOmniauth.new.method(:issuer)
end
