# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdFedera
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'federa_login'
    end

    def self.feature_title
      'FedERa/SPID Single sign-on'
    end

    def self.feature_description
      'Allow citizens to authenticate via FedERa (SPID/CIE/CNS) Italian SSO.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'environment', required: true, schema: {
      type: 'string',
      title: 'Environment',
      description: 'Test environment or live production environment',
      enum: %w[test production],
      default: 'test',
      private: true
    }

    add_setting 'spid_level', required: true, schema: {
      type: 'string',
      title: 'SPID Level',
      description: 'SPID authentication level (1, 2, or 3)',
      enum: %w[1 2 3],
      default: '1',
      private: true
    }
  end
end
