# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdHoplr
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'hoplr_login'
    end

    def self.feature_title
      'Hoplr Login'
    end

    def self.feature_description
      'Allow users to authenticate with a Hoplr account.'
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
      description: 'Live on the production environment or still testing on their test environment?',
      enum: %w[test production],
      default: 'production',
      private: true
    }

    add_setting 'client_id', required: true, schema: {
      title: 'Client ID',
      type: 'string',
      private: true
    }

    add_setting 'client_secret', required: true, schema: {
      title: 'Client Secret',
      type: 'string',
      private: true
    }

    add_setting 'neighbourhood_custom_field_key', required: false, schema: {
      private: true,
      type: 'string',
      title: 'Neighbourhood custom field key',
      description: 'The `key` attribute of the custom field where the neighbourhood should be stored. Leave empty to not store the neighbourhood.'
    }
  end
end
