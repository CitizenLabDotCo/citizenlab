# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdViennaSaml
  module CitizenFeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'vienna_citizen_login'
    end

    def self.feature_title
      'Vienna citizen Single sign-on'
    end

    def self.feature_description
      'Allow vienna citizens to authenticate via StandardPortal Single sign-on.'
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
