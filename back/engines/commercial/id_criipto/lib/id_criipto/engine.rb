# frozen_string_literal: true

module IdCriipto
  class Engine < ::Rails::Engine
    isolate_namespace IdCriipto

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdCriipto::FeatureSpecification)

      criipto = CriiptoOmniauth.new
      IdMethod.add_method(criipto)
      AuthenticationService.add_method('criipto', criipto)
    end
  end
end
