# frozen_string_literal: true

module Files
  # Service for generating AI-powered multilingual descriptions of file content.
  #
  # @example Basic usage
  #   Files::DescriptionGenerator.new.generate_descriptions!(file)
  class DescriptionGenerator
    class DescriptionGenerationError < StandardError; end
    class LLMError < DescriptionGenerationError; end

    delegate :generate_descriptions?, to: :class

    # Generate and update the descriptions for the given file
    # @return [Boolean] true if descriptions were updated, false if not.
    def generate_descriptions!(file)
      return false unless generate_descriptions?(file)

      validate_file!(file)
      descriptions = generate_descriptions(file, configured_locales)

      file.with_lock do
        # Only add descriptions if the file still does not have any descriptions.
        # "still" because the descriptions could have been added while the descriptions
        # were being generated.
        next false if file.description_multiloc.present?

        file.update!(description_multiloc: descriptions)
      end
    end

    private

    def validate_file!(file); end

    # Get configured locales for the application
    #
    # @return [Array<String>] Array of locale codes
    def configured_locales
      @configured_locales ||= AppConfiguration.instance.settings('core', 'locales')
    end

    # Generate descriptions using LLM for all configured locales
    #
    # @param content [String] The extracted file content
    # @param locales [Array<String>] Array of locale codes
    # @return [Hash] Hash with locale keys and description values
    def generate_descriptions(file, locales)
      prompt = build_description_prompt(locales)

      chat = RubyLLM.chat(model: 'gpt-4.1')
      response = chat.ask(prompt, with: file.content.full_url)
      parse_llm_response(response.content, locales)
    end

    # Build the prompt for LLM description generation
    #
    # @param locales [Array<String>] Array of locale codes
    # @return [String] The formatted prompt
    def build_description_prompt(locales)
      <<~PROMPT
        Analyze the provided document and generate a concise description or abstract (2-3 sentences) that accurately summarizes its nature, main purpose, key content, and relevant context. 
        The description should be informative and capture the essential meaning of the document.

        Output the results as a properly formatted JSON object with the following requirements:
        - Avoid starting the summary with "The document is..." or similar generic introductions.
        - Keys must be the following locale codes: #{locales.join(', ')}
        - Values must be the description text accurately translated for each respective locale
        - All translations should maintain the same meaning and level of detail
        - Use proper JSON formatting with double quotes around all keys and string values
        - Ensure the JSON is valid and parseable

        The response must contain ONLY the JSON object - no additional text, explanations, code blocks, or formatting outside the JSON structure.

        Example format:
        #{JSON.pretty_generate(locales.map { |locale| [locale, "... (description in #{locale}) ..."] }.to_h)}
      PROMPT
    end

    # @param response_content [String] The raw LLM response
    # @param expected_locales [Array<String>] Expected locale codes
    # @return [Hash] Parsed descriptions hash
    # @raise [LLMError] if response cannot be parsed
    def parse_llm_response(response_content, expected_locales)
      json_content = response_content.strip
        # Remove any markdown code block formatting if present
        .delete_prefix('```json').delete_suffix('```')

      begin
        parsed_response = JSON.parse(json_content)

        missing_locales = expected_locales - parsed_response.keys
        if missing_locales.any?
          ErrorReporter.report_msg("LLM response is missing locales: #{missing_locales.join(', ')}", extra: {
            response_content: json_content,
            file_id: file.id
          })
        end

        supported_locales = CL2_SUPPORTED_LOCALES.map(&:to_s)
        invalid_locales = parsed_response.keys - supported_locales
        if invalid_locales.any?
          ErrorReporter.report_msg("LLM response contains invalid locales: #{invalid_locales.join(', ')}", extra: {
            response_content: json_content,
            file_id: file.id
          })
        end

        # We are lenient and accept any additional *valid* locales in the response.
        parsed_response.slice(*supported_locales)
      rescue JSON::ParserError => e
        raise LLMError, "Invalid JSON response from LLM: #{e.message}"
      end
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
