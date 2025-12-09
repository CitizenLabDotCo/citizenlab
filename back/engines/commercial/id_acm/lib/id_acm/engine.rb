# frozen_string_literal: true

module IdAcm
  class Engine < ::Rails::Engine
    isolate_namespace IdAcm

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdAcm::FeatureSpecification)

      acm = AcmOmniauth.new
      Verification.add_method(acm)
      AuthenticationService.add_method('acm', acm)
    end
  end
end
