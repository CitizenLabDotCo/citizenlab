# frozen_string_literal: true

require 'omniauth-auth0'

module CustomIdMethods
  class Engine < ::Rails::Engine
    isolate_namespace CustomIdMethods

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      ID_METHODS = [
        CustomIdMethods::Facebook::FacebookOmniauth.new,
        CustomIdMethods::Google::GoogleOmniauth.new,

        CustomIdMethods::AzureActiveDirectory::AzureActiveDirectoryOmniauth.new,
        CustomIdMethods::AzureActiveDirectoryB2c::AzureActiveDirectoryB2cOmniauth.new,
        CustomIdMethods::Acm::AcmOmniauth.new,
        CustomIdMethods::Auth0::Auth0Omniauth.new,
        CustomIdMethods::Bogus::BogusVerification.new,
        CustomIdMethods::BosaFas::BosaFasOmniauth.new,
        CustomIdMethods::ClaveUnica::ClaveUnicaOmniauth.new,
        CustomIdMethods::Cow::CowVerification.new,
        CustomIdMethods::Criipto::CriiptoOmniauth.new,
        CustomIdMethods::FakeSso::FakeSsoOmniauth.new,
        CustomIdMethods::Federa::FederaOmniauth.new,
        CustomIdMethods::Franceconnect::FranceconnectOmniauth.new,
        CustomIdMethods::GentRrn::GentRrnVerification.new,
        CustomIdMethods::Hoplr::HoplrOmniauth.new,
        CustomIdMethods::IdAustria::IdAustriaOmniauth.new,
        CustomIdMethods::IdCardLookup::IdCardLookupVerification.new,
        CustomIdMethods::Keycloak::KeycloakOmniauth.new,
        CustomIdMethods::NemlogIn::NemlogInOmniauth.new,
        CustomIdMethods::OostendeRrn::OostendeRrnVerification.new,
        CustomIdMethods::Twoday::TwodayOmniauth.new,
        CustomIdMethods::ViennaSaml::EmployeeSamlOmniauth.new,
        CustomIdMethods::ViennaSaml::CitizenSamlOmniauth.new
      ].each do |id_method|
        IdMethods.add_method(id_method)
      end
    end
  end
end
