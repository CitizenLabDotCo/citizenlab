# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdViennaSaml
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'vienna_login'
    end

    def self.feature_title
      'Vienna Standardportal Login'
    end

    def self.feature_description
      'Allow users to authenticate with a Vienna Standardportal account.'
    end

    add_setting 'environment', required: true, schema: {
      type: 'string',
      title: 'Environment',
      description: 'Test environment or live production environment',
      enum: %w[production test],
      default: 'production',
      private: true
    }
  end
end
