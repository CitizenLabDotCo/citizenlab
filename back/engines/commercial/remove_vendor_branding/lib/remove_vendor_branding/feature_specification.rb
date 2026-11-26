# frozen_string_literal: true

module RemoveVendorBranding
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'remove_vendor_branding'
    end

    def self.feature_title
      'Remove Go Vocal Branding'
    end

    def self.feature_description
      <<~DESC
        Remove Go Vocal logo from the bottom of the platform and the emails.
      DESC
    end
  end
end
