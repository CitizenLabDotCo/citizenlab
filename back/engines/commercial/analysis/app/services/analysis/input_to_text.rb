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

    def execute(input, include_id: false, truncate_values: nil, override_field_labels: {})
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
        label = override_field_labels[field.id] || @multiloc_service.t(field.title_multiloc)
        full_value = field.accept(vv)
        next if full_value&.blank? || (full_value.is_a?(String) && full_value.strip.blank?)

        value = truncate_values ? full_value&.truncate(truncate_values) : full_value
        obj[label] = value
      end
    end

    def formatted(input, **options)
      execute(input, **options).map do |label, value|
        "### #{label}\n#{value}\n"
      end.join("\n")
    end

    def format_all(inputs, shorten_labels: false, **options)
      # Replacing the labels of the questions (= custom_fields) in the generated text with
      # QUESTION_X in order to save on characters, in case the `shorted_label`
      # option is set
      override_field_labels = if shorten_labels
        @custom_fields.sort_by(&:ordering).each_with_object({}) do |field, obj|
          label = @multiloc_service.t(field.title_multiloc)
          if label.size > 20
            obj[field.id] = "QUESTION_#{field.ordering}"
          end
        end
      else
        {}
      end

      formatted_inputs = inputs
        .map { |input| formatted(input, **options.merge(override_field_labels: override_field_labels)) }
        .reject { |text| text.strip.blank? }
        .join("\n---\n")

      if override_field_labels.present?
        <<~__OUTPUT__
          To shorten the list of responses, some questions are abbreviated with following codes:
          #{override_field_labels.map do |field_id, abbreviation|
              "#{abbreviation}: #{@multiloc_service.t(@custom_fields.find { |cf| cf.id == field_id }.title_multiloc)}\n"
            end.join}
          
          #{formatted_inputs}
        __OUTPUT__
      else
        formatted_inputs
      end
    end
  end
end
