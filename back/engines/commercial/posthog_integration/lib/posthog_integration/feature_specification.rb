# frozen_string_literal: true

# Engine namespace
module PosthogIntegration
  module FeatureSpecification
    # Note that we are extending (not including) here!
    extend CitizenLab::Mixins::FeatureSpecification

    # will be used as the property key in the main settings json schema
    def self.feature_name
      'posthog_integration'
    end

    def self.feature_title
      'Posthog Integration'
    end

    # optional
    def self.feature_description
      <<~DESC
        Enables sending events to Posthog for product analytics. PostHog only tracks admins and moderators.
      DESC
    end
  end
end
