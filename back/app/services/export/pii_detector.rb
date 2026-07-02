# frozen_string_literal: true

module Export
  # Flags input fields that collect personal data, so the export UI can
  # pre-select them for redaction. All fields — including registration/user
  # fields — are classified in a single LLM call (`field_pii_detection` use
  # case) from their title, description and options.
  # Best-effort: the admin makes the final call in review, so if the LLM is
  # unavailable we fall back to flagging the fields that are structurally
  # personal data (registration/user fields).
  class PiiDetector
    USE_CASE = 'field_pii_detection'
    RESPONSE_SCHEMA = { type: 'array', items: { type: 'string' } }.freeze

    # The keys of the fields that collect personal data, computed in a single
    # LLM call over all fields.
    def personal_data_keys(fields)
      classify_with_llm(fields)
    rescue StandardError => e
      # Keep the export review working even if the model/credentials are down;
      # fall back to the structurally-known personal fields for the admin to review.
      ErrorReporter.report(e)
      structural_pii_keys(fields)
    end

    private

    def classify_with_llm(fields)
      return Set.new if fields.empty?

      prompt = ::Analysis::LLM::Prompt.new.fetch(USE_CASE, fields: fields_for_prompt(fields))
      response = llm.chat(prompt, response_schema: RESPONSE_SCHEMA)
      # Schema-aware models return a parsed array; be robust to models that
      # return the JSON as text. A parse failure falls through to the
      # structural fallback.
      response = JSON.parse(response) if response.is_a?(String)
      sent_keys = fields.to_set(&:key)
      Array(response).select { |key| sent_keys.include?(key) }.to_set
    end

    def structural_pii_keys(fields)
      fields.select { |field| structural_pii?(field) }.to_set(&:key)
    end

    def structural_pii?(field)
      field.resource_type == 'User' || field.key.start_with?('u_')
    end

    def fields_for_prompt(fields)
      fields.map do |field|
        {
          key: field.key,
          title: multiloc_service.t(field.title_multiloc),
          description: multiloc_service.t(field.description_multiloc),
          input_type: field.input_type,
          options: field.ordered_transformed_options.map { |option| multiloc_service.t(option.title_multiloc) }
        }
      end
    end

    def llm
      @llm ||= LLMSelector.new.llm_class_for_use_case(USE_CASE).new
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
