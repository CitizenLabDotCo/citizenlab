# frozen_string_literal: true

module IdViennaSaml
  class Engine < ::Rails::Engine
    isolate_namespace IdViennaSaml

    config.to_prepare do
      vienna_employee_saml = IdViennaSaml::EmployeeSamlOmniauth.new
      vienna_citizen_saml = IdViennaSaml::CitizenSamlOmniauth.new

      AuthenticationService.add_method('vienna_employee', vienna_employee_saml)
      AuthenticationService.add_method('vienna_citizen', vienna_citizen_saml)

      Verification.add_method(vienna_employee_saml)
      Verification.add_method(vienna_citizen_saml)
    end
  end
end
