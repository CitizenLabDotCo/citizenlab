# frozen_string_literal: true

module CustomIdMethods
  class Engine < ::Rails::Engine
    isolate_namespace CustomIdMethods

    AUTH_AND_VERIFICATION_METHODS = %w[
      FakeSsoOmniauth
      KeycloakOmniauth
      Auth0Omniauth
      ClaveUnicaOmniauth
      CriiptoOmniauth
      FranceconnectOmniauth
      IdAustriaOmniauth
      TwodayOmniauth
      NemlogInOmniauth
    ]

    VERIFICATION_ONLY_METHODS = %w[
      BogusVerification
      BosaFasOmniauth
      CowVerification
      GentRrnVerification
      OostendeRrnVerification
    ]

    AUTH_ONLY_METHODS = %w[
      HoplrOmniauth
    ]

    config.to_prepare do
      AUTH_AND_VERIFICATION_METHODS.each do |method|
        instance = "CustomIdMethods::#{method}".constantize.new
        AuthenticationService.add_method(instance.name, instance)
        Verification.add_method(instance)
      end

      VERIFICATION_ONLY_METHODS.each do |method|
        instance = "CustomIdMethods::#{method}".constantize.new
        Verification.add_method(instance)
      end

      AUTH_ONLY_METHODS.each do |method|
        instance = "CustomIdMethods::#{method}".constantize.new
        AuthenticationService.add_method(instance.name, instance)
      end

      AppConfiguration::Settings.add_feature(CustomIdMethods::FeatureSpecification)

      # TODO: Change this to be in the verification settings for NemlogIn
      AppConfiguration::Settings.add_feature(CustomIdMethods::KkiLocationApiFeatureSpecification)
    end
  end
end
