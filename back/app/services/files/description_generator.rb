# frozen_string_literal: true

module Files
  # Service for generating AI-powered multilingual descriptions of file content.
  #
  # @example Basic usage
  #   Files::DescriptionGenerator.new.generate_descriptions!(file)
  class DescriptionGenerator
    PROMPT = <<~PROMPT
      Analyze the provided document and generate a concise description or abstract (2-3 sentences) that accurately summarizes its nature, main purpose, key content, and relevant context. 
      The description should be informative and capture the essential meaning of the document.

      Requirements:
      - Avoid starting the summary with "The document is..." or similar generic introductions if possible
      - Ensure translations are culturally appropriate and linguistically natural for each locale
      - Values must be the description text accurately translated for each respective locale
      - All translations should maintain the same meaning and level of detail
    PROMPT

    delegate :generate_descriptions?, to: :class

    # Generate and update the descriptions for the given file
    # @return [Boolean] true if descriptions were updated, false if not.
    def generate_descriptions!(file)
      return false unless generate_descriptions?(file)

      descriptions = generate_descriptions(file, tenant_locales)

      file.with_lock do
        # Only add descriptions if the file still does not have any descriptions.
        # "still" because the descriptions could have been added while the descriptions
        # were being generated.
        next false if file.description_multiloc.present?

        file.update!(description_multiloc: descriptions)
      end
    end

    private

    # Get configured locales for the application
    #
    # @return [Array<String>] Array of locale codes
    def tenant_locales
      @tenant_locales ||= AppConfiguration.instance.settings('core', 'locales')
    end

    # Generate descriptions using LLM for all configured locales
    #
    # @param content [String] The extracted file content
    # @param locales [Array<String>] Array of locale codes
    # @return [Hash] Hash with locale keys and description values
    def generate_descriptions(file, locales)
      schema = description_schema(locales)
      chat = RubyLLM.chat(model: 'gpt-4.1').with_schema(schema)
      chat.ask(PROMPT, with: file.content.full_url).content
    end

    def description_schema(locales)
      {
        type: 'object',
        required: locales,
        properties: locales.index_with { { type: 'string', minLength: 1, maxLength: 1000 } },
        additionalProperties: false
      }
    end

    class << self
      # Enqueue a job to generate descriptions for the given file if it meets the
      # eligibility criteria. Additionally, there's a unique constraint (defined on the
      # +job_trackers+ table) that prevents multiple jobs *with tracking* from being
      # enqueued for the same file. This helps keep the definition of generation process
      # status simpler for the initial implementation. To retry a job (which we currently
      # do not support in the product), the existing tracker must be deleted first.
      #
      # @param file [Files::File] The file to generate descriptions for
      # @return [Boolean] true if a job was enqueued, false otherwise.
      def enqueue_job(file)
        return false unless generate_descriptions?(file)

        Files::DescriptionGenerationJob.with_tracking.perform_later(file)
        true
      rescue PG::UniqueViolation
        Rails.logger.info('Description generation job already exists for file.', file_id: file.id)
        false
      end

      def generate_descriptions?(file)
        return false unless file.ai_processing_allowed
        return false if file.description_multiloc.present?
        return false if file.content.blank?

        true
      end
    end
  end
end
