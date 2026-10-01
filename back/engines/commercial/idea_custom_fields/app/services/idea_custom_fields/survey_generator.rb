# frozen_string_literal: true

module IdeaCustomFields
  # Asks an LLM to design a native survey from the admin's instructions and/or source
  # files, and returns it as the `fields` input of the `replace_form_fields` MCP tool.
  class SurveyGenerator
    class InvalidOutputError < StandardError; end

    INPUT_TYPES = %w[
      text multiline_text number select multiselect ranking
      linear_scale rating matrix_linear_scale sentiment_linear_scale
    ].freeze
    OPTION_TYPES = %w[select multiselect ranking].freeze
    LABELED_SCALE_TYPES = %w[linear_scale matrix_linear_scale sentiment_linear_scale].freeze
    SCALE_TYPES = [*LABELED_SCALE_TYPES, 'rating'].freeze
    SENTIMENT_SCALE_MAXIMUM = 5

    PDF_EXTENSIONS = %w[.pdf].freeze
    TEXT_EXTENSIONS = %w[.md .txt].freeze
    FILE_EXTENSIONS = [*PDF_EXTENSIONS, *TEXT_EXTENSIONS].freeze

    # Claude's structured output only accepts closed objects (`additionalProperties:
    # false`) without numeric bounds, so counts and ranges are enforced in #clean_pages.
    QUESTION_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[input_type title description required options statements scale_maximum scale_labels],
      properties: {
        input_type: { type: 'string', enum: INPUT_TYPES },
        title: { type: 'string' },
        description: { type: 'string', description: 'Optional help text. Empty string if none.' },
        required: { type: 'boolean' },
        options: { type: 'array', items: { type: 'string' } },
        statements: { type: 'array', items: { type: 'string' } },
        scale_maximum: { type: 'integer' },
        scale_labels: { type: 'array', items: { type: 'string' } }
      }
    }.freeze

    RESPONSE_SCHEMA = {
      type: 'object',
      additionalProperties: false,
      required: %w[pages],
      properties: {
        pages: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: %w[title description questions],
            properties: {
              title: { type: 'string' },
              description: { type: 'string', description: 'Empty string if none.' },
              questions: { type: 'array', items: QUESTION_SCHEMA }
            }
          }
        }
      }
    }.freeze

    def initialize(phase, locale)
      @phase = phase
      @locale = locale
    end

    # @param prompt [String, nil] the admin's instructions
    # @param files [Array<Files::File>] PDF, Markdown or plain text source documents
    # @return [Array<Hash>] the complete, ordered field list, ending with the form end page
    def generate(prompt:, files: [])
      response = llm.chat(message(prompt, files), response_schema: RESPONSE_SCHEMA)
      raise InvalidOutputError, 'The LLM response is not a JSON object.' unless response.is_a?(Hash)

      pages = clean_pages(response.deep_stringify_keys['pages'])
      raise InvalidOutputError, 'The LLM response contains no usable question.' if pages.empty?

      [*pages.flat_map { |page| page_fields(page) }, end_page]
    end

    private

    def message(prompt, files)
      files.each do |file|
        raise ArgumentError, "File #{file.id} is not allowed to be processed by AI." unless file.ai_processing_allowed
      end

      pdf_files, text_files = files.partition { |file| extension(file).in?(PDF_EXTENSIONS) }
      raise ArgumentError, 'Unsupported file type.' unless text_files.all? { |file| extension(file).in?(TEXT_EXTENSIONS) }

      text = ::Analysis::LLM::Prompt.new.fetch(
        'survey_generation',
        locale: @locale,
        instructions: prompt,
        source_texts: text_files.map { |file| file.content.read.force_encoding('UTF-8').scrub }
      )

      ::Analysis::LLM::Message.new(text, *pdf_files)
    end

    def clean_pages(pages)
      Array(pages).filter_map do |page|
        questions = Array(page['questions']).filter_map { |question| clean_question(question) }
        next if questions.empty?

        page.merge('questions' => questions)
      end
    end

    def clean_question(question)
      input_type = question['input_type']
      title = question['title'].to_s.strip
      options = clean_strings(question['options'])
      statements = clean_strings(question['statements'])

      return if INPUT_TYPES.exclude?(input_type) || title.blank?
      return if OPTION_TYPES.include?(input_type) && options.size < 2
      return if input_type == 'matrix_linear_scale' && statements.empty?

      question.merge('title' => title, 'options' => options, 'statements' => statements)
    end

    def clean_strings(values)
      Array(values).map { |value| value.to_s.strip }.compact_blank
    end

    def page_fields(page)
      [page_field(page), *page['questions'].map { |question| question_field(question) }]
    end

    def page_field(page)
      {
        input_type: 'page',
        page_layout: 'default',
        title_multiloc: multiloc(page['title']),
        description_multiloc: html_multiloc(page['description'])
      }
    end

    def question_field(question)
      input_type = question['input_type']
      field = {
        input_type: input_type,
        title_multiloc: multiloc(question['title']),
        description_multiloc: html_multiloc(question['description']),
        required: question['required'] == true
      }

      if OPTION_TYPES.include?(input_type)
        field[:options] = question['options'].map { |option| { title_multiloc: multiloc(option) } }
      end

      if input_type == 'matrix_linear_scale'
        field[:matrix_statements] = question['statements'].map { |statement| { title_multiloc: multiloc(statement) } }
      end

      field.merge!(scale_attributes(question)) if SCALE_TYPES.include?(input_type)
      field
    end

    def scale_attributes(question)
      maximum = if question['input_type'] == 'sentiment_linear_scale'
        SENTIMENT_SCALE_MAXIMUM
      else
        question['scale_maximum'].to_i.clamp(CustomField::LINEAR_SCALE_MAX_RANGE)
      end

      attributes = { maximum: maximum }
      return attributes unless LABELED_SCALE_TYPES.include?(question['input_type'])

      Array(question['scale_labels']).first(maximum).each_with_index do |label, index|
        attributes[:"linear_scale_label_#{index + 1}_multiloc"] = multiloc(label)
      end

      attributes
    end

    # Reuses the form's current end page, so that a customized one keeps its content.
    def end_page
      form = @phase.custom_form || CustomForm.new(participation_context: @phase)
      page = IdeaCustomFieldsService.new(form).all_fields.find(&:form_end_page?)

      {
        id: (page.id if page.persisted?),
        input_type: 'page',
        key: 'form_end',
        page_layout: page.page_layout,
        title_multiloc: active_locales_only(page.title_multiloc),
        description_multiloc: active_locales_only(page.description_multiloc),
        page_button_label_multiloc: active_locales_only(page.page_button_label_multiloc),
        page_button_link: page.page_button_link,
        include_in_printed_form: false
      }.compact
    end

    def multiloc(text)
      text.to_s.strip.present? ? { @locale => text.to_s.strip } : {}
    end

    def html_multiloc(text)
      text.to_s.strip.present? ? { @locale => "<p>#{ERB::Util.html_escape(text.to_s.strip)}</p>" } : {}
    end

    # The MCP tool rejects multilocs with locales that are no longer active on the platform.
    def active_locales_only(multiloc)
      (multiloc || {}).slice(*AppConfiguration.instance.settings('core', 'locales'))
    end

    def extension(file)
      ::File.extname(file.name).downcase
    end

    def llm
      @llm ||= LLMSelector.new.llm_class_for_use_case('survey_generation').new
    end
  end
end
