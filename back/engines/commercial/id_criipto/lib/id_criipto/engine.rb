# frozen_string_literal: true

module IdCriipto
  class Engine < ::Rails::Engine
    isolate_namespace IdCriipto

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdCriipto::FeatureSpecification)
      IdMethod.add_method('criipto', CriiptoOmniauth.new)
    end
  end
end
