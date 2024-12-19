# frozen_string_literal: true

module IdViennaSaml
  class Engine < ::Rails::Engine
    isolate_namespace IdViennaSaml

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdViennaSaml::EmployeeFeatureSpecification)
      AppConfiguration::Settings.add_feature(IdViennaSaml::CitizenFeatureSpecification)

      vienna_employee_saml = IdViennaSaml::EmployeeSamlOmniauth.new
      vienna_citizen_saml = IdViennaSaml::CitizenSamlOmniauth.new

      IdMethod.add_method('vienna_employee', vienna_employee_saml)
      IdMethod.add_method('vienna_citizen', vienna_citizen_saml)
    end
  end
end
