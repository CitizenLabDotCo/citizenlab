# frozen_string_literal: true

module FlagInappropriateContent
  class ToxicityDetectionService
    MAP_TOXICITY_LABEL = {
      'A' => 'insult',
      'B' => 'harmful',
      'C' => 'sexually_explicit',
      'D' => 'spam',
      'E' => nil,
      'F' => 'guideline_violation'
    }
    FLAGGABLE_TO_DEFAULT_ATTRIBUTES = {
      'Idea' => %i[title_multiloc body_multiloc location_description],
      'Comment' => %i[body_multiloc]
    }
    # location_description has no entry: an address or map pin is not
    # classifiable on its own and was the main source of spam false positives.
    ATTRIBUTE_TO_FIELD_CODE = {
      title_multiloc: 'title_multiloc',
      body_multiloc: 'body_multiloc'
    }.freeze

    def initialize
      # Some clusters (e.g. Canada) are not allowed to send data to the US or Europe.
      return if ENV.fetch('AWS_TOXICITY_DETECTION_REGION', nil).blank?

      @llm = LLMSelector.new.llm_class_for_use_case('toxicity_detection').new
    end

    # @return [InappropriateContentFlag, nil] The flag if one was created, nil otherwise
    def flag_toxicity!(flaggable, attributes: nil)
      return unless AppConfiguration.instance.feature_activated? 'flag_inappropriate_content'

      attributes ||= default_attributes(flaggable)
      flag_service = InappropriateContentFlagService.new

      classification = check_toxicity(flaggable, attributes:)
      if classification
        flag_service.introduce_flag! flaggable, classification
      elsif (flag = flaggable.inappropriate_content_flag)
        flag.update! toxicity_label: nil
        flag_service.maybe_delete! flag
        nil
      end
    end

    def check_toxicity(flaggable, attributes: nil)
      attributes ||= default_attributes(flaggable)
      text = flaggable_to_text(flaggable, attributes)
      return if text.blank?

      classify_toxicity(text, flaggable)
    end

    private

    def default_attributes(flaggable)
      FLAGGABLE_TO_DEFAULT_ATTRIBUTES[flaggable.class.name]
    end

    def flaggable_to_text(flaggable, attributes)
      case flaggable
      when Idea then idea_to_text(flaggable, attributes)
      when Comment then comment_to_text(flaggable)
      end
    end

    # Serialize the input with the same mechanics the analysis engine uses for
    # its prompts, so the model sees each answer below the form question it
    # responds to.
    def idea_to_text(idea, attributes)
      codes = attributes.filter_map { |attribute| ATTRIBUTE_TO_FIELD_CODE[attribute.to_sym] }
      return '' if codes.empty?

      fields = IdeaCustomFieldsService.new(idea.custom_form).all_fields.select { |field| codes.include?(field.code) }
      Analysis::InputToText.new(fields).formatted(idea)
    end

    def comment_to_text(comment)
      body = multiloc_service.t(comment.body_multiloc)
      body = MentionService.new.remove_expanded_mentions(body)
      ActionController::Base.helpers.strip_tags(body)
    end

    def classify_toxicity(text, flaggable)
      return if !@llm # Some clusters (e.g. Canada) are not allowed to send data to the US or Europe.

      prompt = Analysis::LLM::Prompt.new.fetch(
        'toxicity_detection',
        text:,
        project_title: project_title(flaggable),
        parent_post_title: parent_post_title(flaggable),
        custom_guidelines:
      )
      response = @llm.chat(prompt, response_schema:)
      toxicity_label = MAP_TOXICITY_LABEL[response['category']]
      return if !toxicity_label

      { toxicity_label:, ai_reason: response['reason'] }
    end

    def project_title(flaggable)
      project = flaggable.is_a?(Comment) ? flaggable.idea&.project : flaggable.project
      multiloc_service.t(project&.title_multiloc).presence
    end

    def parent_post_title(flaggable)
      return unless flaggable.is_a?(Comment)

      multiloc_service.t(flaggable.idea&.title_multiloc).presence
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end

    def custom_guidelines
      return @custom_guidelines if defined? @custom_guidelines

      @custom_guidelines = AppConfiguration.instance.settings('flag_inappropriate_content', 'custom_guidelines').presence
    end

    def response_schema
      categories = MAP_TOXICITY_LABEL.keys
      categories -= ['F'] if custom_guidelines.blank?
      {
        type: 'object',
        additionalProperties: false,
        required: %w[category reason],
        properties: {
          category: {
            type: 'string',
            enum: categories,
            description: 'The category that best describes the message'
          },
          reason: {
            type: 'string',
            description: 'A short explanation of why the chosen category applies'
          }
        }
      }
    end
  end
end
