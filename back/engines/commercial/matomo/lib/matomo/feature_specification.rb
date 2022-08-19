# frozen_string_literal: true

# Engine namespace
module Matomo
  module FeatureSpecification
    # Note that we are extending (not including) here!
    extend CitizenLab::Mixins::FeatureSpecification

    # will be used as the property key in the main settings json schema
    def self.feature_name
      'matomo'
    end

    def self.feature_title
      'Matomo Integration'
    end

    # optional
    def self.feature_description
      <<~DESC
        Enables sending front-end events to matomo for analytics
      DESC
    end

    # Adding settings to the feature
    add_setting 'tenant_site_id', schema: {
      type: 'string',
      description: 'The unique ID of the matomo site tracking this tenant.',
      default: ENV.fetch('DEFAULT_MATOMO_TENANT_SITE_ID', '')
    }
    add_setting 'product_site_id', schema: {
      type: 'string',
      description: 'The unique ID of the matomo site tracking this tenant for product analytics',
      default: ENV.fetch('MATOMO_PRODUCT_SITE_ID', '')
    }
  end
end
