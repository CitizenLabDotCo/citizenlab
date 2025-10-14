# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module CustomAuthVerification
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'verification'
    end

    def self.feature_title
      'Custom SSO and Verification'
    end

    def self.feature_description
      'Custom single sign-on and user verification methods developed for customers.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    # To list all the methods in admin HQ settings
    def self.all_methods_json_schema
      all_methods = ::Verification.all_methods + [CustomAuthVerification::HoplrOmniauth.new]
      schema = all_methods.map do |method|
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
      end.to_json
      # binding.pry
      schema.to_json
    end

    add_setting "verification_methods", schema: {
          "title": "Enabled Methods",
          "private": true,
          "type": "array",
          "default": [],
          "items": {
            "anyOf": all_methods_json_schema
            }
          }
  end
end
