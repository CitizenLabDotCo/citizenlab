module CustomStyle
  class Engine < ::Rails::Engine
    isolate_namespace CustomStyle
    config.generators.api_only = true

    def self.register_feature
      require 'custom_style/feature_specification'
      AppConfiguration::Settings.add_feature(CustomStyle::FeatureSpecification)
    end
    
    config.to_prepare do
      CustomStyle::Engine.register_feature
    end
  end
end
