# frozen_string_literal: true

module IdFranceconnect
  class Engine < ::Rails::Engine
    isolate_namespace IdFranceconnect

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdFranceconnect::FeatureSpecification)
      IdMethod.add_method('franceconnect', FranceconnectOmniauth.new)
    end
  end
end
