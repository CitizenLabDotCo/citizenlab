# frozen_string_literal: true

Rails.application.config.to_prepare do
  AppConfiguration::Settings.add_feature(Verification::FeatureSpecification)
end
