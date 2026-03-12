# frozen_string_literal: true

module IdFedera
  class Engine < ::Rails::Engine
    isolate_namespace IdFedera

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdFedera::FeatureSpecification)

      federa = IdFedera::FederaOmniauth.new
      AuthenticationService.add_method('federa', federa)
      Verification.add_method(federa)
    end
  end
end
