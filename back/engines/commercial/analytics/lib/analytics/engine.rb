module Analytics
  class Engine < ::Rails::Engine
    isolate_namespace Analytics

    config.to_prepare do
      require 'analytics/feature_specification'
      AppConfiguration::Settings.add_feature(Analytics::FeatureSpecification)
    end

    # Allow migrations to be created and run within the app
    # initializer :append_migrations do |app|
    #   unless app.root.to_s.match root.to_s
    #     config.paths["db/migrate"].expanded.each do |expanded_path|
    #       app.config.paths["db/migrate"] << expanded_path
    #     end
    #
    #   end
    # end

  end
end
