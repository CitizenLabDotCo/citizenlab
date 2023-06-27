# frozen_string_literal: true

module PublicApi
  class PublicApiController
    class InvalidEnumParameterValueError < ArgumentError
      attr_reader :parameter_name, :parameter_value, :allowed_values

      def initialize(parameter_name, parameter_value, allowed_values)
        @parameter_name = parameter_name
        @parameter_value = parameter_value
        @allowed_values = allowed_values

        super("#{title}: #{detail}")
      end

      def problem_id
        'invalid-parameter-value-enum'
      end

      def title
        'Invalid value for an enum parameter'
      end

      def detail
        <<~MSG.squish
          The value '#{parameter_value}' is not allowed for the parameter '#{parameter_name}'.
          Accepted values are: #{allowed_values.join(', ')}.
        MSG
      end

      def extra_details
        {
          parameter_name: parameter_name,
          parameter_value: parameter_value,
          allowed_values: allowed_values
        }
      end
    end
  end
end
