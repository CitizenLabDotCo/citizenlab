module Matomo # Engine namespace
  module FeatureSpecification
    # Note that we are extending (not including) here!
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name # will be used as the property key in the main settings json schema
      'matomo'
    end

    def self.feature_title
      'Matomo Integration'
    end

    def self.feature_description # optional
      <<~DESC
        Enables sending front-end events to matomo for analytics
      DESC
    end

    # Adding settings to the feature
    add_setting 'tenant_site_id', schema: {
      "type": "string",
      "description": "The unique ID of the matomo site tracking this tenant.",
      "default": ENV.fetch('DEFAULT_MATOMO_TENANT_SITE_ID', '')
    }
    add_setting 'product_site_id', schema: {
      "type": "string",
      "description": "The unique ID of the matomo site tracking this tenant for product analytics",
      "default": ENV.fetch('MATOMO_PRODUCT_SITE_ID', '')
    }
  end
end
