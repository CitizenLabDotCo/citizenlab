# frozen_string_literal: true

module IdClaveUnica
  class Engine < ::Rails::Engine
    isolate_namespace IdClaveUnica

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdClaveUnica::FeatureSpecification)
      IdMethod.add_method('clave_unica', ClaveUnicaOmniauth.new)
    end
  end
end
