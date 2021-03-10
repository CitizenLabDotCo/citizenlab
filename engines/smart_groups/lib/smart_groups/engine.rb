module SmartGroups
  class Engine < ::Rails::Engine
    isolate_namespace SmartGroups

    if Rails.env.development? || Rails.env.test?
      config.autoload_paths << "#{config.root}/lib"
    else
      config.eager_load_paths << "#{config.root}/lib"
    end

    config.to_prepare do
      AppConfiguration::Settings.add_feature(SmartGroups::FeatureSpecification)
    end
  end
end
