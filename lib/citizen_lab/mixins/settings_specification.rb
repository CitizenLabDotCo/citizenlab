# frozen_string_literal: true

module CitizenLab
  module Mixins
    module SettingsSpecification
      # @return [String] Name of the settings group
      def settings_name
        raise NotImplementedError
      end

      # @return [String]
      def settings_json_schema_str
        @settings_json_schema_str ||= JSON.dump(settings_json_schema)
      end

      def settings_json_schema
        @settings_json_schema ||= JSON.parse(settings_json_schema_str)
      end
    end
  end
end


