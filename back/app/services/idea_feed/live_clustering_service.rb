module IdeaFeed
  # Service used by the IdeaFeed ideation_method to automatically update the
  # Topics, and classify ideas into them. The service is intended to be run
  # periodically (e.g. every hour) to keep the topics and idea classifications
  # up to date with the latest ideas. It tries to strike a balance between
  # accuracy and stability of the clusters.
  class LiveClusteringService
    class InvalidLLMResponse < StandardError; end
    RETRIES_INVALID_RESPONSE = 3

    def initialize(phase)
      @phase = phase
    end

    # `rebalance_topics!` is supposed to be called periodically (every day or
    # few days) to update the topics. It tries to keep the topics stable to some
    # extent, but also reshuffles them if needed.
    def rebalance_topics!
      new_topics = run_topic_model

      Topic.transaction do
        new_topics.each do |new_topic|
          topic = Topic.create!(
            title_multiloc: new_topic['title_multiloc'],
            description_multiloc: new_topic['description_multiloc']
          )
          ProjectsAllowedInputTopic.create!(
            project: @phase.project,
            topic:
          )
        end
      end
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

    def run_topic_model
      llm = LLMSelector.new.llm_claz_for_use_case('idea_feed_live_topic_model').new
      inputs = @phase.ideas.published

      prompt = topic_model_prompt(inputs)
      # puts prompt

      llm.chat(prompt, response_schema: topic_model_response_schema)
      # puts response
    end

    def topic_model_response_schema
      locales = AppConfiguration.instance.settings('core', 'locales') || ['en']
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title_multiloc: {
              type: 'object',
              description:
              "The title of the topic in #{locales.join(', ')}",
              properties: locales.index_with { |locale| { type: 'string', description: "The title in #{locale}" } },
              additionalProperties: false
            },
            description_multiloc: {
              type: 'object',
              description: "A short description of the topic in #{locales.join(', ')}",
              properties: locales.index_with { |locale| { type: 'string', description: "The description in #{locale}" } },
              additionalProperties: false
            }
          },
          required: %w[title_multiloc description_multiloc],
          additionalProperties: false
        }
      }
    end

    def classification_response_schema
      {
        type: 'array',
        items: { type: 'number', description: 'The ID of a topic (1-based index)' }
      }
    end

    def topic_model_prompt(inputs)
      form = @phase.pmethod.custom_form
      input_texts = Analysis::InputToText.new(custom_fields_without_topics(form)).format_all(inputs)
      ::Analysis::LLM::Prompt.new.fetch('idea_feed_live_topic_modeling',
        multiloc_service: MultilocService.new,
        project_description:,
        project: @phase.project,
        custom_fields: custom_fields_without_topics(form),
        inputs_text: input_texts)
    end

    def project_description
      description_multiloc = if (layout = ContentBuilder::Layout.find_by(content_buildable: @phase.project, code: 'project_description', enabled: true))
        ContentBuilder::Craftjs::VisibleTextualMultilocs.new(layout.craftjs_json).extract_and_join
      else
        @phase.project.description_multiloc
      end
      multiloc_service.t(description_multiloc)
    end
  end
end
