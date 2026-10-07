# frozen_string_literal: true

# The project generator is a core-app feature (projects are a core resource), so its
# feature flag is registered here rather than from an engine's `to_prepare`.
Rails.application.config.to_prepare do
  AppConfiguration::Settings.add_feature(ProjectGeneration::FeatureSpecification)
end
