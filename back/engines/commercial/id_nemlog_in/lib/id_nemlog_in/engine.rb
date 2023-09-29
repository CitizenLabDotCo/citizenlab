# frozen_string_literal: true

module IdNemlogIn
  class Engine < ::Rails::Engine
    isolate_namespace IdNemlogIn

    config.to_prepare do
      nemlog_in_omniauth = NemlogInOmniauth.new
      Verification::VerificationService.add_method(nemlog_in_omniauth)

      AppConfiguration::Settings.add_feature(IdNemlogIn::KkiLocationApiFeatureSpecification)
    end
  end
end
