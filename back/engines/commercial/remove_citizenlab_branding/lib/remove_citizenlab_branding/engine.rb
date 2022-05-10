module RemoveCitizenlabBranding
  class Engine < ::Rails::Engine
    isolate_namespace RemoveCitizenlabBranding

    config.to_prepare do
      require 'remove_citizenlab_branding/feature_specification'
      AppConfiguration::Settings.add_feature(RemoveCitizenlabBranding::FeatureSpecification)
    end
  end
end
