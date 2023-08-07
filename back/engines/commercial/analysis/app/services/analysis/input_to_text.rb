# frozen_string_literal: true

module Analysis
  # Convert an input to a simple string hash of {label => value} entries, based on the
  # passed list of custom fields
  class InputToText
    def initialize(custom_fields, app_configuration = AppConfiguration.instance)
      @custom_fields = custom_fields
      @app_configuration = app_configuration
      @multiloc_service = MultilocService.new(app_configuration: @app_configuration)
    end

    def execute(input, include_id: false)
      # We currently piggyback on the XlsxExport::ValueVisitor, which transforms
      # idea fields (built-in and custom) to string values suitable to display
      # in an excel sheet. Our needs are currently very similar (transforming an
      # input to a plaintext representation suitable for a LLM), so we are
      # reusing this. Probably this should be changed to its own implementation
      # once we optimize further for the LLM use case.
      vv = XlsxExport::ValueVisitor.new(input, {}, app_configuration: @app_configuration)

      initial_object = if include_id
        { 'ID' => input.id }
      else
        {}
      end
      @custom_fields.each_with_object(initial_object) do |field, obj|
        key = @multiloc_service.t(field.title_multiloc)
        value = field.accept(vv)
        obj[key] = value
      end
    end

    def formatted(input, **options)
      execute(input, **options).map do |label, value|
        "### #{label}\n#{value}\n"
      end.join("\n")
    end
  end
end
