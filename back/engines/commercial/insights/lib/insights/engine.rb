# frozen_string_literal: true

module Insights
  class Engine < ::Rails::Engine
    isolate_namespace Insights

    config.to_prepare do
      require 'insights/feature_specifications/manual_flow'
      AppConfiguration::Settings.add_feature(Insights::FeatureSpecifications::ManualFlow)
    end
  end
end
