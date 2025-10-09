# frozen_string_literal: true

module CustomAuthVerification
  class Engine < ::Rails::Engine
    isolate_namespace CustomAuthVerification

    config.to_prepare do
      AppConfiguration::Settings.add_feature(CustomAuthVerification::FeatureSpecification)

      # Fake SSO for testing purposes
      fake_sso_method = FakeSsoOmniauth.new
      AuthenticationService.add_method('fake_sso', fake_sso_method)
      Verification.add_method(fake_sso_method)

      # Keycloak integration (Oslo IDPorten)
      keycloak = KeycloakOmniauth.new
      Verification.add_method(keycloak)
      AuthenticationService.add_method('keycloak', keycloak)

      # Auth0 integration
      # auth0 = Auth0Omniauth.new
      # Verification.add_method(auth0)
      # AuthenticationService.add_method('auth0', auth0)

      # Bogus verification method for testing purposes
      Verification.add_method(BogusVerification.new)

      # BOSA FAS integration - Authentication and verification using the Belgian eID and itsme system
      Verification.add_method(BosaFasOmniauth.new)

      # Clave Unica integration - Authentication and verification using the Chilean Clave Unica system
      clave_unica = ClaveUnicaOmniauth.new
      AuthenticationService.add_method('clave_unica', clave_unica)
      Verification.add_method(clave_unica)

      # Cow
      Verification.add_method(CowVerification.new)

      # Criipto integration - Danish MitID
      criipto = CriiptoOmniauth.new
      Verification.add_method(criipto)
      AuthenticationService.add_method('criipto', criipto)

      # FranceConnect integration
      franceconnect = FranceconnectOmniauth.new
      AuthenticationService.add_method('franceconnect', franceconnect)
      Verification.add_method(franceconnect)

      # Gent RRN verification method
      Verification.add_method(GentRrnVerification.new)

      # Verification by RRN (BE social security number) using an API from the city of Oostende
      Verification.add_method(OostendeRrnVerification.new)

      # ID Austria integration
      id_austria = IdAustriaOmniauth.new
      Verification.add_method(id_austria)
      AuthenticationService.add_method('id_austria', id_austria)

      # twoday integration
      twoday = TwodayOmniauth.new
      Verification.add_method(twoday)
      AuthenticationService.add_method('twoday', twoday)
    end
  end
end
