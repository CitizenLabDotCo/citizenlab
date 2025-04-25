# frozen_string_literal: true

module Analysis
  # Convert an input to a simple string hash of {label => value} entries, based on the
  # passed list of custom fields
  class InputToText < ModelToText
    def initialize(custom_fields, app_configuration = AppConfiguration.instance)
      super()
      @custom_fields = custom_fields
      @app_configuration = app_configuration
      @multiloc_service = MultilocService.new(app_configuration: @app_configuration)
      @memoized_field_values = Hash.new { |h, k| h[k] = {} } # Hash with empty hash as default values
      @comments_to_text = CommentsToText.new
    end

    def execute(input, include_id: false, truncate_values: nil, override_field_labels: {})
      @custom_fields.each_with_object(super) do |field, obj|
        add_field(field, input, obj, truncate_values: truncate_values, override_field_labels: override_field_labels)
        if field.other_option_text_field
          add_field(field.other_option_text_field, input, obj, truncate_values: truncate_values, override_field_labels: override_field_labels)
        end
        if field.input_type == 'sentiment_linear_scale'
          add_field(field.follow_up_text_field, input, obj, truncate_values: truncate_values, override_field_labels: override_field_labels)
        end
      end
    end

    def formatted(input, **options)
      output = super(input, **options.except(:include_comments))
      if options[:include_comments]
        comments = @comments_to_text.execute(input, truncate_values: options[:truncate_values], separator: '+++', include_author: false)
        output += "### Comments by other users\n#{comments}" if comments.present?
      end
      output
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
        .map { |input| formatted(input, **options, override_field_labels: override_field_labels) }
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

    private

    def input_field_value(input, custom_field)
      # We memoize as certain of these operations can be relatively slow,
      # especially in case of HTML fields, since they need to be converted to
      # plain text
      if input.id && custom_field.id && @memoized_field_values[input.id][custom_field.id]
        return @memoized_field_values[input.id][custom_field.id]
      end

      # We currently piggyback on the Export::Xlsx::ValueVisitor, which transforms
      # idea fields (built-in and custom) to string values suitable to display
      # in an excel sheet. Our needs are currently very similar (transforming an
      # input to a plaintext representation suitable for a LLM), so we are
      # reusing this. Probably this should be changed to its own implementation
      # once we optimize further for the LLM use case.
      options_by_key = custom_field.options.index_by(&:key)
      value_for_llm = case custom_field.input_type
      when 'ranking'
        ranking_field_value(input, custom_field, options_by_key)
      when 'matrix_linear_scale'
        matrix_linear_scale_field_value(input, custom_field)
      else
        xlsx_field_value(input, custom_field, options_by_key)
      end

      @memoized_field_values[input.id][custom_field.id] = value_for_llm
    end

    def add_field(field, input, obj, truncate_values: nil, override_field_labels: {})
      label = override_field_labels[field.id] || @multiloc_service.t(field.title_multiloc)
      full_value = input_field_value(input, field)
      return if full_value&.blank? || (full_value.is_a?(String) && full_value.strip.blank?)

      value = truncate_values ? full_value&.truncate(truncate_values) : full_value
      obj[label] = value
    end

    def ranking_field_value(input, custom_field, options_by_key)
      stored_value = input.custom_field_values[custom_field.key]
      (stored_value || []).map.with_index do |option_key, index|
        title_multiloc = options_by_key[option_key]&.title_multiloc
        option_title = title_multiloc ? @multiloc_service.t(title_multiloc) : ''
        "#{index + 1}. #{option_title}"
      end.join("\n")
    end

    def matrix_linear_scale_field_value(input, custom_field)
      stored_values = input.custom_field_values[custom_field.key]
      return '' if !stored_values

      statements_by_key = custom_field.matrix_statements.index_by(&:key)
      stored_values.map do |statement_key, value|
        title_multiloc = statements_by_key[statement_key]&.title_multiloc
        statement_title = title_multiloc ? @multiloc_service.t(title_multiloc) : ''
        label_multiloc = custom_field.nth_linear_scale_multiloc(value)
        value_str = label_multiloc.present? ? "#{value} (#{@multiloc_service.t(label_multiloc)})" : value.to_s
        "#{statement_title} - #{value_str}"
      end.join("\n")
    end

    def xlsx_field_value(input, custom_field, options_by_key)
      vv = Export::Xlsx::ValueVisitor.new(input, options_by_key, app_configuration: @app_configuration)
      custom_field.accept(vv)
    end
  end
end
