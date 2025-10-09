# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module CustomAuthVerification
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'fake_sso'
    end

    def self.feature_title
      'Fake SSO'
    end

    def self.feature_description
      'Allow users to authenticate and verify through a fake SSO service.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'issuer', required: false, schema: {
      title: 'Issuer',
      type: 'string',
      private: true
    }
  end
end
