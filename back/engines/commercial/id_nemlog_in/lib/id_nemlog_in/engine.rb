# frozen_string_literal: true

module IdNemlogIn
  class Engine < ::Rails::Engine
    isolate_namespace IdNemlogIn

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdNemlogIn::FeatureSpecification)
      AppConfiguration::Settings.add_feature(IdNemlogIn::KkiLocationApiFeatureSpecification)
      IdMethod.add_method('nemlog_in', NemlogInOmniauth.new)
    end
  end
end
