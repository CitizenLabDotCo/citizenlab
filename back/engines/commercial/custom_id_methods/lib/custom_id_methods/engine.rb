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
      IdMethods.add_method(facebook)

      google = CustomIdMethods::Google::GoogleOmniauth.new
      AuthenticationService.add_method('google', google)
      IdMethods.add_method(google)

      azure_ad = CustomIdMethods::AzureActiveDirectory::AzureActiveDirectoryOmniauth.new
      AuthenticationService.add_method('azureactivedirectory', azure_ad)
      IdMethods.add_method(azure_ad)

      azure_ad_b2c = CustomIdMethods::AzureActiveDirectoryB2c::AzureActiveDirectoryB2cOmniauth.new
      AuthenticationService.add_method('azureactivedirectory_b2c', azure_ad_b2c)
      IdMethods.add_method(azure_ad_b2c)

      acm = CustomIdMethods::Acm::AcmOmniauth.new
      IdMethods.add_method(acm)
      AuthenticationService.add_method('acm', acm)

      IdMethods.add_method(CustomIdMethods::Auth0::Auth0Omniauth.new)

      IdMethods.add_method(CustomIdMethods::Bogus::BogusVerification.new)

      IdMethods.add_method(CustomIdMethods::BosaFas::BosaFasOmniauth.new)

      clave_unica = CustomIdMethods::ClaveUnica::ClaveUnicaOmniauth.new
      AuthenticationService.add_method('clave_unica', clave_unica)
      IdMethods.add_method(clave_unica)

      IdMethods.add_method(CustomIdMethods::Cow::CowVerification.new)

      criipto = CustomIdMethods::Criipto::CriiptoOmniauth.new
      IdMethods.add_method(criipto)
      AuthenticationService.add_method('criipto', criipto)

      fake_sso = CustomIdMethods::FakeSso::FakeSsoOmniauth.new
      AuthenticationService.add_method('fake_sso', fake_sso)
      IdMethods.add_method(fake_sso)

      federa = CustomIdMethods::Federa::FederaOmniauth.new
      AuthenticationService.add_method('federa', federa)
      IdMethods.add_method(federa)

      franceconnect = CustomIdMethods::Franceconnect::FranceconnectOmniauth.new
      AuthenticationService.add_method('franceconnect', franceconnect)
      IdMethods.add_method(franceconnect)

      IdMethods.add_method(CustomIdMethods::GentRrn::GentRrnVerification.new)

      hoplr = CustomIdMethods::Hoplr::HoplrOmniauth.new
      AuthenticationService.add_method('hoplr', hoplr)
      IdMethods.add_method(hoplr)

      id_austria = CustomIdMethods::IdAustria::IdAustriaOmniauth.new
      IdMethods.add_method(id_austria)
      AuthenticationService.add_method('id_austria', id_austria)

      IdMethods.add_method(CustomIdMethods::IdCardLookup::IdCardLookupVerification.new)

      keycloak = CustomIdMethods::Keycloak::KeycloakOmniauth.new
      IdMethods.add_method(keycloak)
      AuthenticationService.add_method('keycloak', keycloak)

      IdMethods.add_method(CustomIdMethods::NemlogIn::NemlogInOmniauth.new)

      IdMethods.add_method(CustomIdMethods::OostendeRrn::OostendeRrnVerification.new)

      twoday = CustomIdMethods::Twoday::TwodayOmniauth.new
      IdMethods.add_method(twoday)
      AuthenticationService.add_method('twoday', twoday)

      vienna_employee = CustomIdMethods::ViennaSaml::EmployeeSamlOmniauth.new
      vienna_citizen = CustomIdMethods::ViennaSaml::CitizenSamlOmniauth.new
      AuthenticationService.add_method('vienna_employee', vienna_employee)
      AuthenticationService.add_method('vienna_citizen', vienna_citizen)
      IdMethods.add_method(vienna_employee)
      IdMethods.add_method(vienna_citizen)
    end
  end
end
