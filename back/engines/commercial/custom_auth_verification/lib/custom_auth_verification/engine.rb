# frozen_string_literal: true

module CustomAuthVerification
  class Engine < ::Rails::Engine
    isolate_namespace CustomAuthVerification

    AUTH_AND_VERIFICATION_METHODS = %w[
      FakeSsoOmniauth
      KeycloakOmniauth
      Auth0Omniauth
      ClaveUnicaOmniauth
      CriiptoOmniauth
      FranceconnectOmniauth
      IdAustriaOmniauth
      TwodayOmniauth
    ]

    VERIFICATION_ONLY_METHODS = %w[
      BogusVerification
      BosaFasOmniauth
      CowVerification
      GentRrnVerification
      OostendeRrnVerification
    ]

    config.to_prepare do
      AUTH_AND_VERIFICATION_METHODS.each do |method|
        instance = "CustomAuthVerification::#{method}".constantize.new
        AuthenticationService.add_method(instance.name, instance)
        Verification.add_method(instance)
      end

      VERIFICATION_ONLY_METHODS.each do |method|
        instance = "CustomAuthVerification::#{method}".constantize.new
        Verification.add_method(instance)
      end
    end
  end
end
