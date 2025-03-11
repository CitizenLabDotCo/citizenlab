# frozen_string_literal: true

module IdHoplr
  class Engine < ::Rails::Engine
    isolate_namespace IdHoplr

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdHoplr::FeatureSpecification)
      IdMethod.add_method('hoplr', HoplrOmniauth.new)
    end
  end
end
