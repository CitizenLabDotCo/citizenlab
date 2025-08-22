# frozen_string_literal: true

module Files
  # Service for generating AI-powered multilingual descriptions of file content.
  #
  # @example Basic usage
  #   Files::DescriptionGenerator.new.generate_descriptions!(file)
  class DescriptionGenerator
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
      chat = RubyLLM.chat(model: infer_best_model)
      prompt = build_prompt(file.name, locales)
      prefill_msg = '{' # Prefill the response to encourage the LLM to respond with a JSON object

      # @type [RubyLLM::Message]
      response = with_preprocessed_file_content(file) do |source|
        chat.add_message(role: :user, content: RubyLLM::Content.new(prompt, source))
        chat.add_message(role: :assistant, content: prefill_msg)
        chat.complete
      end

      content = prefill_msg + response.content
      parse_llm_response(content, locales)
    end

    # Selects the best available Claude model for the Bedrock provider.
    # Uses Sonnet 4 if available, otherwise falls back to Sonnet 3.7.
    #
    # @return [String] The model ID to use
    def infer_best_model
      available_models = RubyLLM.models
        .select { |model| model.provider == 'bedrock' }
        .map(&:id)

      # These are not full model IDs, but substrings used to find the corresponding model
      # ID, since model IDs can vary depending on the Bedrock region.
      preferred_models = %w[
        anthropic.claude-sonnet-4
        anthropic.claude-3-7-sonnet
      ]

      preferred_models.each do |substring|
        matching_model = available_models.find { |id| id.include?(substring) }
        return matching_model if matching_model
      end

      raise DescriptionGeneratorError, 'No suitable model found for description generation.'
    end

    # Yields the preprocessed file content to the block. If no preprocessing is needed,
    # the original file content is passed. A block is used to ensure that any temporary
    # files are properly closed and deleted after the block exits.
    #
    # @yield [source] The preprocessed file content
    # @yieldparam [Tempfile, BaseFileUploader] source The preprocessed file content
    def with_preprocessed_file_content(file, &)
      preprocessed_file = preprocess_file(file)
      source = preprocessed_file.is_a?(Tempfile) ? preprocessed_file.path : preprocessed_file.full_url
      yield source
    ensure
      preprocessed_file.close! if preprocessed_file.is_a?(Tempfile)
    end

    # @return [Tempfile, BaseFileUploader]
    def preprocess_file(file)
      if file.text?
        file.content
      elsif file.image?
        preprocess_image(file)
      elsif previewable_as_pdf?(file)
        preprocess_previewable_as_pdf(file)
      else # rubocop:disable Lint/DuplicateBranch
        file.content
      end
    end

    # @return [Tempfile, BaseFileUploader]
    def preprocess_previewable_as_pdf(file)
      preview = file.preview

      if preview.content.full_url.present?
        preview.content
      elsif preview.status == 'pending'
        raise PreviewPendingError
      elsif preview.status == 'failed' && docx?(file)
        docx_to_html(file)
      else
        # Just return the file content as is. It will most likely be rejected by the LLM
        # unless support for additional file types is added. The alternative is to raise
        # an error directly.
        file.content
      end
    end

    # @return [Tempfile] Tempfile with HTML content
    def docx_to_html(file)
      Tempfile.open do |local_file|
        local_file.binmode.write(file.content.read)
        doc = Docx::Document.open(local_file.path)

        Tempfile
          .new([file.name, '.html'])
          .tap { |processed_file| processed_file.write(doc.to_html) }
      end
    end

    # @return [Tempfile, BaseFileUploader]
    def preprocess_image(file)
      if file.size < 10.megabytes
        file.content
      elsif file.size > 50.megabytes
        # For now, we don't want to risk overloading our server (disk space and CPU) by
        # processing large images.
        raise ImageSizeLimitExceededError, "Max size is 50MB, but the file is #{file.size} bytes."
      else
        resize_image(file)
      end
    end

    # @return [Tempfile] Tempfile with resized image
    def resize_image(file, max_dim: 1000)
      Tempfile.create do |local_file|
        local_file.binmode.write(file.content.read)
        image = MiniMagick::Image.open(local_file.path)
        image.width > image.height ? image.resize("#{max_dim}x") : image.resize("x#{max_dim}")
        image.tempfile
      end
    end

    def previewable_as_pdf?(file)
      PreviewService.new.should_generate_preview?(file)
    end

    def docx?(file)
      file.content.content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        # Adding the loose check for the file extension bc docx exported by some tools (Google Docs) don't have
        # the correct content type.
        file.name.rpartition('.').last == 'docx'
    end

    def build_prompt(file_name, locales)
      <<~PROMPT
        Analyze the provided document and generate a concise description or abstract (2-3 sentences) that accurately summarizes its nature, main purpose, key content, and relevant context. 
        The description should be informative and capture the essential meaning of the document. As extra context, the filename is: "#{file_name}"

        Output the results as a properly formatted JSON object with the following requirements:
        - Avoid starting the summary with "The document is..." or similar generic introductions.
        - Keys must be the following locale codes: #{locales.join(', ')}
        - Values must be the description text accurately translated for each respective locale
        - All translations should maintain the same meaning and level of detail
        - Use proper JSON formatting with double quotes around all keys and string values
        - Ensure the JSON is valid and parseable

        The response must contain ONLY the JSON object - no additional text, explanations, code blocks, or formatting outside the JSON structure.

        Example format:
        #{JSON.pretty_generate(locales.index_with { |locale| "... (description in #{locale}) ..." })}
      PROMPT
    end

    # @param response_content [String] The raw LLM response
    # @param expected_locales [Array<String>] Expected locale codes
    # @return [Hash] Parsed descriptions hash
    # @raise [InvalidMultilocResponseError] if the response cannot be parsed
    def parse_llm_response(response_content, expected_locales)
      parsed_response = JSON.parse(response_content)

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
      raise InvalidMultilocResponseError, "Failed to parse LLM response as JSON: #{e.message}"
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
      rescue ActiveRecord::RecordNotUnique
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

    class DescriptionGeneratorError < StandardError; end
    class InvalidMultilocResponseError < DescriptionGeneratorError; end
    class ImageSizeLimitExceededError < DescriptionGeneratorError; end
    class PreviewPendingError < DescriptionGeneratorError; end
  end
end
