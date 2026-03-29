# frozen_string_literal: true

module GVPlugins
  class Engine < ::Rails::Engine
    isolate_namespace GVPlugins

    config.to_prepare do
      require 'gv_plugins/feature_specification'
      AppConfiguration::Settings.add_feature(GVPlugins::FeatureSpecification)
    end
  end
end
