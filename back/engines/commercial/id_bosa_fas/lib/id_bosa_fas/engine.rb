# frozen_string_literal: true

module IdBosaFas
  class Engine < ::Rails::Engine
    isolate_namespace IdBosaFas

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdBosaFas::FeatureSpecification)
      bosa_fas_omniauth = BosaFasOmniauth.new
      AuthenticationService.add_method('bosa_fas', bosa_fas_omniauth)
      Verification.add_method(bosa_fas_omniauth)
    end
  end
end
