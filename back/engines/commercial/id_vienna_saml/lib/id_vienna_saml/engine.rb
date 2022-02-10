module IdViennaSaml
  class Engine < ::Rails::Engine
    isolate_namespace IdViennaSaml

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdViennaSaml::FeatureSpecification)

      vienna_saml = IdViennaSaml::IdViennaSamlOmniauth.new
      AuthenticationService.add_method('saml', vienna_saml)
    end
  end
end
