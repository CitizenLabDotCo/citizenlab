module IdeaFeed
  # Service used by the IdeaFeed ideation_method to classify ideas into topics.
  class TopicClassificationService
    class InvalidLLMResponse < StandardError; end
    RETRIES_INVALID_RESPONSE = 3

    def initialize(phase)
      @phase = phase
    end

    # Given an idea, classifies it into one or more topics, overwriting any
    # previous classifications.
    def classify_topics!(idea)
      topics = idea.project.allowed_input_topics
      llm = LLMSelector.new.llm_claz_for_use_case('idea_feed_live_classification').new

      prompt = classification_prompt(idea, topics)
      selected_topics = RETRIES_INVALID_RESPONSE.times do |i|
        response = llm.chat(prompt, response_schema: classification_response_schema)

        # The prompt passes integer IDs (1-based) to the LLM, so we need to
        # convert them back to topics
        raise InvalidLLMResponse unless response.is_a?(Array) && response.all? { |it| it.is_a?(Integer) && it.between?(1, topics.length) }

        selected_topics = response.map { topics[it - 1] }

        if selected_topics.all? { it.is_a?(Topic) }
          break selected_topics
        else
          Rails.logger.warn("LLM response for idea classification contained invalid topic IDs. Attempt #{i + 1} Retrying...")
        end
      rescue InvalidLLMResponse
        # Retry once if the response is not valid JSON
        Rails.logger.warn("LLM response for idea classification was not valid. Attempt #{i + 1}/#{RETRIES_INVALID_RESPONSE} Retrying...")
      end

      idea.update!(topics: selected_topics)

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
        items: { type: 'number', description: 'The ID of a topic (1-based index)' }
      }
    end
  end
end
