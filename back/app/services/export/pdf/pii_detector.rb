# frozen_string_literal: true

module Export
  module Pdf
    # Flags input fields that collect personal data, so the export UI can
    # pre-select them for redaction. Two signals, combined:
    #   1. Registration/user fields — the out-of-form ones (resource_type 'User')
    #      or the in-form ones tagged with a 'u_' key prefix by
    #      UserFieldsInFormService. Structurally personal data, always flagged.
    #   2. An LLM classification of the remaining form questions (title,
    #      description, options), via the `field_pii_detection` use case.
    # Best-effort: the admin makes the final call in review, so on any LLM error
    # we fall back to the structural signal alone.
    class PiiDetector
      USE_CASE = 'field_pii_detection'
      RESPONSE_SCHEMA = { type: 'array', items: { type: 'string' } }.freeze

      # The keys of the fields that collect personal data, computed in a single
      # LLM call (only the non-structural questions are sent to the model).
      def personal_data_keys(fields)
        structural, questions = fields.partition { |field| structural_pii?(field) }
        structural.to_set(&:key).merge(llm_pii_keys(questions))
      end

      private

      def structural_pii?(field)
        field.resource_type == 'User' || field.key.start_with?('u_')
      end

      def llm_pii_keys(fields)
        return [] if fields.empty?

        prompt = ::Analysis::LLM::Prompt.new.fetch(USE_CASE, fields: fields_for_prompt(fields))
        response = llm.chat(prompt, response_schema: RESPONSE_SCHEMA)
        sent_keys = fields.to_set(&:key)
        Array(response).select { |key| sent_keys.include?(key) }
      rescue StandardError => e
        # Keep the export review working even if the model/credentials are down;
        # the structural fields are still flagged and the admin reviews the rest.
        ErrorReporter.report(e)
        []
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
end
