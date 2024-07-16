# frozen_string_literal: true

module ReportBuilder
  class Engine < ::Rails::Engine
    isolate_namespace ReportBuilder
    config.generators.api_only = true

    # Sharing the factories to make them accessible to the main app / other engines.
    begin
      require 'factory_bot_rails'
    rescue LoadError
      # skip
    else
      factories_path = File.expand_path('../../spec/factories', __dir__)
      config.factory_bot.definition_file_paths += [factories_path]
    end

    config.to_prepare do
      require 'report_builder/feature_specifications/report_builder'
      AppConfiguration::Settings.add_feature(ReportBuilder::FeatureSpecifications::ReportBuilder)

      require 'report_builder/feature_specifications/report_data_grouping'
      AppConfiguration::Settings.add_feature(ReportBuilder::FeatureSpecifications::ReportDataGrouping)
    end
  end
end
