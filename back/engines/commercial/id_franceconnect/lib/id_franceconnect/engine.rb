# frozen_string_literal: true

module IdFranceconnect
  class Engine < ::Rails::Engine
    isolate_namespace IdFranceconnect

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdFranceconnect::FeatureSpecification)

      fc = FranceconnectOmniauth.new
      AuthenticationService.add_method('franceconnect', fc)
      IdMethod.add_method(fc)
    end
  end
end
