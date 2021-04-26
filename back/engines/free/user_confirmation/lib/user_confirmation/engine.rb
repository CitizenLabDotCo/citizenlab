module UserConfirmation
  class Engine < ::Rails::Engine
    isolate_namespace UserConfirmation

    config.to_prepare do
      require 'user_confirmation/feature_specification'
      AppConfiguration::Settings.add_feature(UserConfirmation::FeatureSpecification)
    end
  end
end
