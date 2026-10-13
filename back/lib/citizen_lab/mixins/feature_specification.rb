# frozen_string_literal: true

require 'citizen_lab/mixins/settings_specification'

module CitizenLab
  module Mixins
    module FeatureSpecification
      extend SettingsSpecification

      def json_schema
        {
          'type' => 'object',
          'title' => feature_title,
          'description' => feature_description,
          'additionalProperties' => false,
          'required' => %w[allowed enabled],
          'required-settings' => required_settings.presence,
          'early_access' => early_access,
          'properties' => {
            'allowed' => { 'type' => 'boolean', 'default' => allowed_by_default },
            'enabled' => { 'type' => 'boolean', 'default' => enabled_by_default }
          }.merge(settings_props)
        }.compact
      end

      # Feature names should be snake_case strings.
      # @return [String]
      def feature_name
        raise NotImplementedError
      end

      # @return [String]
      def feature_title
        raise NotImplementedError
      end

      # @return [String]
      def feature_description
        nil
      end

      def dependencies
        []
      end

      # Opens the feature to early access: an admin can then switch it on for themselves
      # from their profile settings, whatever the tenant settings say. The value is the
      # tier it is offered in (see AppConfiguration::Settings::EARLY_ACCESS_TIERS):
      # - nil: not offered (the default).
      # - 'general': offered to every admin.
      # - 'internal': offered to Go Vocal staff (super admins) only.
      # Core features set the same tiers with an "early_access" key in their JSON schema.
      #
      # Only use this for features that have no toggle in the admin settings. An admin who
      # opted in sees the feature as on, so the toggle would show the wrong state.
      #
      # @return [String, nil]
      def early_access
        nil
      end

      # @return [Boolean]
      def allowed_by_default
        true
      end

      # @return [Boolean]
      def enabled_by_default
        true
      end

      # @return [Array<Setting>]
      def settings
        @settings ||= []
      end

      # @return [Setting]
      def add_setting(name, schema:, required: false)
        settings << Setting.new(name, required, schema)
      end

      # 'Required-settings' are settings that must be configured if the feature
      # is enabled (and allowed).
      # @return [Array<String>] names of the required settings
      def required_settings
        settings.select(&:required).map(&:name)
      end

      # Mapping from setting name to setting json schema.
      # @return [Hash<String, Hash>]
      def settings_props
        settings.to_h { |setting| [setting.name, setting.schema] }
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
