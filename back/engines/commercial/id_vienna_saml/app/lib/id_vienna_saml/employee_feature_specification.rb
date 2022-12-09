# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdViennaSaml
  module EmployeeFeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'vienna_employee_login'
    end

    def self.feature_title
      'Vienna employee Single sign-on'
    end

    def self.feature_description
      'Allow vienna city employees to authenticate via Single sign-on.'
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
