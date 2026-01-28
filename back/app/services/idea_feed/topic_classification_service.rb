module IdeaFeed
  # Service used by IdeaFeed (presentation_mode='feed') to classify ideas into topics.
  class TopicClassificationService
    class InvalidLLMResponse < StandardError; end
    RETRIES_INVALID_RESPONSE = 3

    def initialize(phase)
      @phase = phase
    end

    # Given an idea, classifies it into one or more topics, overwriting any
    # previous classifications.
    def classify_topics!(idea)
      topics = @phase.project.input_topics.where(depth: 0).order(:lft).includes(:children)
      llm = LLMSelector.new.llm_class_for_use_case('idea_feed_live_classification').new

      prompt = classification_prompt(idea, topics)
      selected_topics = RETRIES_INVALID_RESPONSE.times do |i|
        response = llm.chat(prompt, response_schema: classification_response_schema)

        # The prompt passes integer IDs (1-based) to the LLM, so we need to
        # convert them back to topics
        raise InvalidLLMResponse unless response.is_a?(Array) && response.all? { |it| it.is_a?(String) && it.match?(/\A\d+(\.\d+)?\z/) }

        selected_topics = response.map do |id|
          if id.include?('.')
            parent_index, child_index = id.split('.').map(&:to_i)
            topics[parent_index - 1].children[child_index - 1]
          else
            topics[id.to_i - 1]
          end
        end

        if selected_topics.all? { it.is_a?(InputTopic) }
          break selected_topics
        else
          Rails.logger.warn("LLM response for idea classification contained invalid topic IDs. Attempt #{i + 1} Retrying...")
        end
      rescue InvalidLLMResponse
        # Retry once if the response is not valid JSON
        Rails.logger.warn("LLM response `#{response}`for idea classification was not valid. Attempt #{i + 1}/#{RETRIES_INVALID_RESPONSE} Retrying...")
      end

      idea.update!(input_topics: selected_topics)

      selected_topics
    end

    def classify_all_inputs_in_background!
      classification_jobs = @phase.ideas.published.find_each.map do |input|
        TopicClassificationJob.new(@phase, input)
      end
      ActiveJob.perform_all_later(classification_jobs)
    end

    private

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end

    def classification_prompt(idea, topics)
      form = @phase.pmethod.custom_form
      input_text = Analysis::InputToText.new(custom_fields_without_topics(form)).formatted(idea)
      ::Analysis::LLM::Prompt.new.fetch('idea_feed_live_classification',
        multiloc_service:,
        project: idea.project,
        topics:,
        input_text:)
    end

    def custom_fields_without_topics(form)
      form.custom_fields.reject { |f| f.key == 'topic_ids' }
    end

    def classification_response_schema
      {
        type: 'array',
        items: { type: 'string', description: 'The ID of a (sub)topic (e.g., "1" for a topic or "1.2" for a subtopic)' }
      }
    end
  end
end
