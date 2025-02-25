# frozen_string_literal: true

module IdGoogle
  class Engine < ::Rails::Engine
    isolate_namespace IdGoogle

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdGoogle::FeatureSpecification)
      IdMethod.add_method('google', GoogleOmniauth.new)
    end
  end
end
