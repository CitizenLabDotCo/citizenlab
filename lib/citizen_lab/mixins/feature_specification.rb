# frozen_string_literal: true

require 'citizen_lab/mixins/settings_specification'

module CitizenLab
  module Mixins
    module FeatureSpecification
      extend SettingsSpecification

      def json_schema # rubocop:disable Metrics/MethodLength
        {
          'type' => 'object',
          'title' => feature_title,
          'description' => feature_description,
          'additionalProperties' => false,
          'required' => %w[allowed enabled],
          'required-settings' => required_settings.presence,
          'properties' => {
            'allowed' => { 'type' => 'boolean', 'default' => true },
            'enabled' => { 'type' => 'boolean', 'default' => true }
          }.merge(settings_props)
        }.compact
      end

      def feature_name
        raise NotImplementedError
      end

      def feature_title
        raise NotImplementedError
      end

      def feature_description
        nil
      end

      def settings
        @settings ||= []
      end

      def add_setting(name, schema:, required: false)
        settings << Setting.new(name, required, schema)
      end

      def required_settings
        settings.select(&:required).map(&:name)
      end

      def settings_props
        Hash[settings.map { |setting| [setting.name, setting.schema] }]
      end
    end

    class Setting
      attr_reader :name, :required, :schema

      def initialize(name, required, schema)
        @name = name
        @required = required
        @schema = schema
      end
    end
  end
end
