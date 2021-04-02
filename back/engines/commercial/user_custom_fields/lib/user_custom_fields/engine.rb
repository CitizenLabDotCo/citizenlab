module UserCustomFields
  class Engine < ::Rails::Engine
    isolate_namespace UserCustomFields

    config.to_prepare do
      require 'user_custom_fields/feature_specification'
      AppConfiguration::Settings.add_feature ::UserCustomFields::FeatureSpecification
    end
  end
end
