# frozen_string_literal: true

RM_UNIFY_SAML_SETUP_PROC = lambda do |env|
  IdRmUnify::RmUnifyOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: RM_UNIFY_SAML_SETUP_PROC, name: 'rm_unify'
end
