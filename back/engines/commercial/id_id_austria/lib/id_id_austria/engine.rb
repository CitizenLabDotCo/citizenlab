# frozen_string_literal: true

module IdIdAustria
  class Engine < ::Rails::Engine
    isolate_namespace IdIdAustria

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdIdAustria::FeatureSpecification)
      IdMethod.add_method('id_austria', IdAustriaOmniauth.new)
    end
  end
end
