# frozen_string_literal: true

module IdClaveUnica
  class Engine < ::Rails::Engine
    isolate_namespace IdClaveUnica

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdClaveUnica::FeatureSpecification)

      cu = ClaveUnicaOmniauth.new
      AuthenticationService.add_method('clave_unica', cu)
      IdMethod.add_method(cu)
    end
  end
end
