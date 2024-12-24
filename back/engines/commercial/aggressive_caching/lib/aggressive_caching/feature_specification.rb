# frozen_string_literal: true

# Engine namespace
module AggressiveCaching
  module FeatureSpecification
    # Note that we are extending (not including) here!
    extend CitizenLab::Mixins::FeatureSpecification

    # will be used as the property key in the main settings json schema
    def self.feature_name
      'aggressive_caching'
    end

    def self.feature_title
      'Aggressive caching'
    end

    def self.feature_description
      <<~DESC
        This feature is used to aggressivel cache API responses.
        It should always be turned off, unless in exceptional circumstances where we are experiencing major traffic peaks which the platform can no longer handle.
        When enabled, some data on the platform might take some time to update after changes have been made.'
      DESC
    end

    def self.allowed_by_default
      true
    end

    def self.enabled_by_default
      false
    end
  end
end
