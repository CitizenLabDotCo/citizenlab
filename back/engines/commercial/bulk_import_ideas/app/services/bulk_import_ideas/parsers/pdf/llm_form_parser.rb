# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class LLMFormParser
    def initialize(phase, locale, personal_data_enabled: false)
      @phase = phase
      @locale = locale
      @personal_data_enabled = personal_data_enabled
    end

    # Return in format compatible with idea_to_idea_row
    def parse_idea(file_uploader, page_count)
      parsed_response = parse(file_uploader)

      {
        pdf_pages: (1..page_count).to_a,
        fields: map_response_to_fields(parsed_response)
      }
    end

    private

    def parse(file_uploader)
      pdf_file = Files::File.new(
        name: 'scan.pdf',
        mime_type: 'application/pdf',
        content: file_uploader
      )

      message = Analysis::LLM::Message.new(prompt, pdf_file)

      begin
        response = llm.chat(message, response_schema: schema_builder.output_schema)
      rescue RubyLLM::BadRequestError => e
        raise unless e.message.include?('grammar is too large')

        response = llm.chat(message)
      end

      parse_response(response)
    end

    # RubyLLM auto-parses JSON when a schema is set, so response may be a Hash or a String.
    def parse_response(response)
      return nil if response.blank?
      return response if response.is_a?(Hash)

      parsed = response.match(/\{.+\}/m)&.try(:[], 0)
      parsed.present? ? JSON.parse(parsed) : nil
    end

    def map_response_to_fields(response)
      return {} if response.blank?

      mapping = schema_builder.key_mapping
      result = {}

      response.each do |schema_key, answer|
        field_info = mapping[schema_key]
        next unless field_info

        case field_info[:type]
        when :personal_data
          mapped_value = normalize_answer(answer)
          result[field_info[:label]] = mapped_value if mapped_value.present?
        when :field
          next if not_found?(answer)

          result[field_info[:field_key]] = normalize_answer(answer)
        when :matrix
          matrix_answer = build_matrix_answer(answer, field_info)
          result[field_info[:field_key]] = matrix_answer if matrix_answer.present?
        end
      end

      result
    end

    def build_matrix_answer(answer, field_info)
      return {} unless answer.is_a?(Hash)

      result = {}
      field_info[:statements].each do |sub_key, statement_key|
        sub_answer = answer[sub_key]
        next if sub_answer.blank? || not_found?(sub_answer)

        result[statement_key] = sub_answer
      end
      result
    end

    def normalize_answer(answer)
      return answer if answer.is_a?(Array)
      return nil if not_found?(answer)

      answer
    end

    def not_found?(value)
      value == FormSyncSchemaBuilder::NOT_FOUND
    end

    def prompt
      ::Analysis::LLM::Prompt.new.fetch('form_sync',
        locale: @locale,
        output_schema_json: JSON.pretty_generate(schema_builder.output_schema))
    end

    def schema_builder
      @schema_builder ||= FormSyncSchemaBuilder.new(@phase, @locale, personal_data_enabled: @personal_data_enabled)
    end

    def llm
      @llm ||= LLMSelector.new.llm_class_for_use_case('form_sync').new
    end
  end
end
