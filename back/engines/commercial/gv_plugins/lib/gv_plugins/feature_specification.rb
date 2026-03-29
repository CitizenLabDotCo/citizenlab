# frozen_string_literal: true

module GVPlugins
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'plugins'
    end

    def self.feature_title
      'Plugins'
    end

    def self.feature_description
      'Plugins are a way to extend the functionality of the platform.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'active_plugins', required: false, schema: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        required: %w[url],
        additionalProperties: false,
        properties: {
          url: {
            type: 'string',
            format: 'uri'
          }
        }
      }
    }
  end
end
