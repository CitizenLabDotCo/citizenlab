module FlagInappropriateContent
  class Engine < ::Rails::Engine
    isolate_namespace FlagInappropriateContent

    config.to_prepare do
      require 'flag_inappropriate_content/feature_specification'
      AppConfiguration::Settings.add_feature ::FlagInappropriateContent::FeatureSpecification
    end
  end
end
