# frozen_string_literal: true

module Verification
  class Engine < ::Rails::Engine
    isolate_namespace Verification

    def self.register_feature
      require 'verification/feature_specification'
      AppConfiguration::Settings.add_feature(Verification::FeatureSpecification)
    end

    config.to_prepare do
      Verification::Engine.register_feature
    end
  end
end
