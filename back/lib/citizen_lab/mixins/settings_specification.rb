# frozen_string_literal: true

module CitizenLab
  module Mixins
    module SettingsSpecification
      # @return [String]
      def json_schema_str
        @json_schema_str ||= json_schema.to_json
      end

      def json_schema
        @json_schema ||= JSON.parse(json_schema_str)
      end
    end
  end
end


