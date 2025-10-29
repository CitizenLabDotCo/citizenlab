# frozen_string_literal: true

module Verification
  module VerificationMethod
    # Schema definitions for common parameters
    SCHEMA_CLIENT_ID = {
      client_id: {
        private: true,
        type: 'string',
        title: 'Client ID'
      }
    }.freeze

    SCHEMA_CLIENT_SECRET = {
      client_secret: {
        private: true,
        type: 'string',
        title: 'Client secret'
      }
    }.freeze

    SCHEMA_ENABLED_FOR_VERIFIED_ACTIONS = {
      enabled_for_verified_actions: {
        private: true,
        type: 'boolean',
        description: 'Whether this verification method should be enabled for verified actions.'
      }
    }.freeze

    SCHEMA_HIDE_FROM_PROFILE = {
      hide_from_profile: {
        private: true,
        type: 'boolean',
        description: 'Should verification be hidden in the user profile and under the username?'
      }
    }.freeze

    SCHEMA_DOMAIN = {
      domain: {
        private: true,
        type: 'string',
        title: 'Domain'
      }
    }.freeze

    SCHEMA_ENVIRONMENT = {
      environment: {
        type: 'string',
        title: 'Environment',
        enum: %w[production integration],
        default: 'production',
        private: true
      }
    }

    # It allows to migrate from one provider to another. See how it's overridden.
    def name_for_hashing
      name
    end

    def name
      nil
    end

    # @return [Hash, nil]
    def config
      AppConfiguration.instance
        .settings('verification', 'verification_methods')
        .find { |method| method['name'] == name }
        .to_h # if find returns nil
        .except('allowed', 'enabled')
        .symbolize_keys
        .presence
    end

    def enabled_for_verified_actions?
      config[:enabled_for_verified_actions] || false
    end

    def config_parameters_schema
      default_config_schema
    end

    def config_parameters
      config_parameters_schema.keys
    end

    private

    def default_config_schema(default_name_in_ui = nil)
      schema = if default_name_in_ui
        {
          ui_method_name: {
            type: 'string',
            title: 'Method name in UI',
            description: 'The name this verification method will have in the UI',
            default: default_name_in_ui
          }
        }
      else
        {}
      end
      schema.merge!(SCHEMA_CLIENT_SECRET)
      schema.merge!(SCHEMA_CLIENT_ID)
      schema.merge!(SCHEMA_ENABLED_FOR_VERIFIED_ACTIONS)
      schema.merge!(SCHEMA_HIDE_FROM_PROFILE)
      schema
    end
  end
end
