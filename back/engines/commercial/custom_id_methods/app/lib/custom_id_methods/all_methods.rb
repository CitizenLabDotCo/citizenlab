# frozen_string_literal: true

module CustomIdMethods
  module AllMethods
    AUTH_AND_VERIFICATION_METHODS = %w[
      FakeSso::FakeSsoOmniauth
      Keycloak::KeycloakOmniauth
      Auth0::Auth0Omniauth
      ClaveUnica::ClaveUnicaOmniauth
      Criipto::CriiptoOmniauth
      Franceconnect::FranceconnectOmniauth
      IdAustria::IdAustriaOmniauth
      Twoday::TwodayOmniauth
      NemlogIn::NemlogInOmniauth
    ].freeze

    VERIFICATION_ONLY_METHODS = %w[
      Bogus::BogusVerification
      BosaFas::BosaFasOmniauth
      Cow::CowVerification
      GentRrn::GentRrnVerification
      OostendeRrn::OostendeRrnVerification
      IdCardLookup::IdCardLookupVerification
    ].freeze

    AUTH_ONLY_METHODS = %w[
      Hoplr::HoplrOmniauth
    ].freeze
  end
end
