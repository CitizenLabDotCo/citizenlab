# frozen_string_literal: true

# Employees SAML SSO
VIENNA_SAML_EMPLOYEE_SETUP_PROC = lambda do |env|
  IdViennaSaml::EmployeeSamlOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: VIENNA_SAML_EMPLOYEE_SETUP_PROC, name: 'vienna_employee'
end

# Citizens SAML SSO
VIENNA_SAML_CITIZEN_SAML_SETUP_PROC = lambda do |env|
  IdViennaSaml::CitizenSamlOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  options = { setup: VIENNA_SAML_CITIZEN_SAML_SETUP_PROC, name: 'vienna_citizen' }
  options[:sp_entity_id] = 'citizenlabtest' if Rails.env.development? || Rails.env.test?
  provider :saml, **options
end
