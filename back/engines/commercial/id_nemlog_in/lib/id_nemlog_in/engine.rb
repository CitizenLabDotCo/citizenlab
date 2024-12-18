# frozen_string_literal: true

module IdNemlogIn
  class Engine < ::Rails::Engine
    isolate_namespace IdNemlogIn

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdNemlogIn::FeatureSpecification)

      nemlog_in_omniauth = NemlogInOmniauth.new
      AuthenticationService.add_method('nemlog_in', nemlog_in_omniauth)
      IdMethod.add_method(nemlog_in_omniauth)

      AppConfiguration::Settings.add_feature(IdNemlogIn::KkiLocationApiFeatureSpecification)
    end
  end
end
