module IdeaFeed
  # Service used by the IdeaFeed ideation_method to automatically update the
  # Topics, and classify ideas into them. The service is intended to be run
  # periodically (e.g. every hour) to keep the topics and idea classifications
  # up to date with the latest ideas. It tries to strike a balance between
  # accuracy and stability of the clusters.
  class LiveClusteringService
    RETRIES_INVALID_RESPONSE = 3

    def initialize(phase)
      @phase = phase
    end

    # `rebalance_topics!` is supposed to be called periodically (every day or
    # few days) to update the topics. It tries to keep the topics stable to some
    # extent, but also reshuffles them if needed.
    def rebalance_topics!
      new_topics = model_topics
    end

    def classify(idea)
      topics = idea.project.allowed_input_topics
      llm = LLMSelector.new.llm_claz_for_use_case('idea_feed_live_classification').new

      prompt = classification_prompt(idea, topics)
      puts prompt

      selected_topics = RETRIES_INVALID_RESPONSE.times do |i|
        response = llm.chat(prompt)
        puts response

        topic_ids = JSON.parse(response)
        selected_topics = topic_ids.map { topics[it - 1] }

        if selected_topics.all? { it.is_a?(Topic) }
          break selected_topics
        else
          Rails.logger.warn("LLM response for idea classification contained invalid topic IDs. Attempt #{i + 1} Retrying...")
        end
      rescue JSON::ParserError
        # Retry once if the response is not valid JSON
        Rails.logger.warn("LLM response for idea classification was not valid JSON. Attempt #{i + 1} Retrying...")
      end

      idea.update!(topics: selected_topics)

      selected_topics
    end

    private

    def classification_prompt(idea, topics)
      form = @phase.pmethod.custom_form
      input_text = Analysis::InputToText.new(custom_fields_without_topics(form)).formatted(idea)
      multiloc_service = MultilocService.new
      ::Analysis::LLM::Prompt.new.fetch('idea_feed_live_classification',
        multiloc_service:,
        project: idea.project,
        topics:,
        input_text:)
    end

    def custom_fields_without_topics(form)
      form.custom_fields.reject { |f| f.key == 'topic_ids' }
    end

    def model_topics
    end
  end
end
