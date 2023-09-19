# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module Verification
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'verification'
    end

    def self.feature_title
      'Verification'
    end

    def self.feature_description
      'Use a pre-defined list to verify user identities during registration.'
    end

    add_setting 'verification_methods', required: true, schema: {
      title: 'Verification Methods',
      private: true,
      type: 'array',
      default: [],
      items: {
        anyOf: VerificationService.new.all_methods.map do |method|
          {
            type: 'object',
            title: method.name,
            required: ['name'],
            properties: {
              name: { type: 'string', enum: [method.name], default: method.name, readOnly: true },
              **method.config_parameters.to_h do |cp|
                parameter_schema = method.respond_to?(:config_parameters_schema) && method.config_parameters_schema[cp]
                [cp, parameter_schema || { type: 'string', private: 'true' }]
              end
            }
          }
        end
      }
    }
  end
end
