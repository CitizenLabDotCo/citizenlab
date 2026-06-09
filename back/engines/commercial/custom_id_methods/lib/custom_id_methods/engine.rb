# frozen_string_literal: true

require 'omniauth-auth0'

module CustomIdMethods
  class Engine < ::Rails::Engine
    isolate_namespace CustomIdMethods

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      # Built-in login-only SSO methods (moved here from back/lib/omniauth_methods).
      # Their configuration lives in `verification.verification_methods`, so they
      # are registered both as authentication methods and as (login-only)
      # verification methods.
      facebook = CustomIdMethods::Facebook::FacebookOmniauth.new
      AuthenticationService.add_method('facebook', facebook)
      Verification.add_method(facebook)

      google = CustomIdMethods::Google::GoogleOmniauth.new
      AuthenticationService.add_method('google', google)
      Verification.add_method(google)

      azure_ad = CustomIdMethods::AzureActiveDirectory::AzureActiveDirectoryOmniauth.new
      AuthenticationService.add_method('azureactivedirectory', azure_ad)
      Verification.add_method(azure_ad)

      azure_ad_b2c = CustomIdMethods::AzureActiveDirectoryB2c::AzureActiveDirectoryB2cOmniauth.new
      AuthenticationService.add_method('azureactivedirectory_b2c', azure_ad_b2c)
      Verification.add_method(azure_ad_b2c)

      acm = CustomIdMethods::Acm::AcmOmniauth.new
      Verification.add_method(acm)
      AuthenticationService.add_method('acm', acm)

      Verification.add_method(CustomIdMethods::Auth0::Auth0Omniauth.new)

      Verification.add_method(CustomIdMethods::Bogus::BogusVerification.new)

      Verification.add_method(CustomIdMethods::BosaFas::BosaFasOmniauth.new)

      clave_unica = CustomIdMethods::ClaveUnica::ClaveUnicaOmniauth.new
      AuthenticationService.add_method('clave_unica', clave_unica)
      Verification.add_method(clave_unica)

      Verification.add_method(CustomIdMethods::Cow::CowVerification.new)

      criipto = CustomIdMethods::Criipto::CriiptoOmniauth.new
      Verification.add_method(criipto)
      AuthenticationService.add_method('criipto', criipto)

      fake_sso = CustomIdMethods::FakeSso::FakeSsoOmniauth.new
      AuthenticationService.add_method('fake_sso', fake_sso)
      Verification.add_method(fake_sso)

      federa = CustomIdMethods::Federa::FederaOmniauth.new
      AuthenticationService.add_method('federa', federa)
      Verification.add_method(federa)

      franceconnect = CustomIdMethods::Franceconnect::FranceconnectOmniauth.new
      AuthenticationService.add_method('franceconnect', franceconnect)
      Verification.add_method(franceconnect)

      Verification.add_method(CustomIdMethods::GentRrn::GentRrnVerification.new)

      hoplr = CustomIdMethods::Hoplr::HoplrOmniauth.new
      AuthenticationService.add_method('hoplr', hoplr)
      Verification.add_method(hoplr)

      id_austria = CustomIdMethods::IdAustria::IdAustriaOmniauth.new
      Verification.add_method(id_austria)
      AuthenticationService.add_method('id_austria', id_austria)

      Verification.add_method(CustomIdMethods::IdCardLookup::IdCardLookupVerification.new)

      keycloak = CustomIdMethods::Keycloak::KeycloakOmniauth.new
      Verification.add_method(keycloak)
      AuthenticationService.add_method('keycloak', keycloak)

      nemlog_in = CustomIdMethods::NemlogIn::NemlogInOmniauth.new
      AuthenticationService.add_method('nemlog_in', nemlog_in)
      Verification.add_method(nemlog_in)

      Verification.add_method(CustomIdMethods::OostendeRrn::OostendeRrnVerification.new)

      twoday = CustomIdMethods::Twoday::TwodayOmniauth.new
      Verification.add_method(twoday)
      AuthenticationService.add_method('twoday', twoday)

      vienna_employee = CustomIdMethods::ViennaSaml::EmployeeSamlOmniauth.new
      vienna_citizen = CustomIdMethods::ViennaSaml::CitizenSamlOmniauth.new
      AuthenticationService.add_method('vienna_employee', vienna_employee)
      AuthenticationService.add_method('vienna_citizen', vienna_citizen)
      Verification.add_method(vienna_employee)
      Verification.add_method(vienna_citizen)
    end
  end
end
