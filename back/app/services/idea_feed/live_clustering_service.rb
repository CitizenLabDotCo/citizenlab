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
      @llm = LLMSelector.new.llm_claz_for_use_case('idea_feed_live_topic_model').new
    end

    # `rebalance_topics!` is supposed to be called periodically (every day or
    # few days) to update the topics. It tries to keep the topics stable to some
    # extent, but also reshuffles them if needed.
    def rebalance_topics!
      old_topics = @phase.project.allowed_input_topics

      # Run the topic model from scratch on the current set of inputs
      new_topics = run_topic_model

      # Compare the new topics with the existing topics to find matches
      if old_topics.any?
        mapping = run_map_old_to_new_topics(old_topics, new_topics)

        update_log = update_changed_topics!(mapping, old_topics, new_topics)
        creation_log = create_new_topics!(mapping, new_topics)
        removal_log = remove_obsolete_topics!(mapping, old_topics)
      else
        creation_log = create_new_topics!({}, new_topics)
      end

      log_topics_rebalanced_activity(update_log:, creation_log:, removal_log:)
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

    def run_topic_model
      inputs = @phase.ideas.published

      prompt = topic_model_prompt(inputs)
      # puts prompt

      @llm.chat(prompt, response_schema: topic_model_response_schema)
      # puts response
    end

    def run_map_old_to_new_topics(old_topics, new_topics)
      prompt = topic_mapping_prompt(old_topics, new_topics)
      @llm.chat(prompt, response_schema: topic_mapping_response_schema(old_topics))
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

    def topic_mapping_prompt(old_topics, new_topics)
      ::Analysis::LLM::Prompt.new.fetch('idea_feed_live_topic_mapping',
        multiloc_service: MultilocService.new,
        project_description:,
        project: @phase.project,
        old_topics:,
        new_topics:)
    end

    def topic_mapping_response_schema(old_topics)
      locales = AppConfiguration.instance.settings('core', 'locales') || ['en']

      {
        type: 'object',
        description: 'A mapping from old topic IDs to new topic IDs',
        additionalProperties: false,
        properties: old_topics.each_with_object({}).with_index do |(_old_topic, hash), i|
          hash["OLD-#{i}"] = {
            type: 'object',
            additionalProperties: false,
            properties: {
              new_topic_id: { type: %w[string null], description: 'The ID of the corresponding new topic (e.g. NEW-5), or null if there is no match' },
              adjusted_topic_title_multiloc: {
                type: 'object',
                description: "An adjusted title of the old topic, incorporating any new nuance from the new topic, if anything. Only make a change if it is really necessary. In languages #{locales.join(', ')}",
                properties: locales.index_with { |locale| { type: 'string', description: "The title in #{locale}" } },
                additionalProperties: false
              },
              adjusted_topic_description_multiloc: {
                type: 'object',
                description: "An adjusted description of the old topic, incorporating any new nuance from the new topic. Only make a change if it is really necessary. In languages #{locales.join(', ')}",
                properties: locales.index_with { |locale| { type: 'string', description: "The title in #{locale}" } },
                additionalProperties: false
              }
            },
            required: %w[new_topic_id]
          }
        end
      }
    end

    def update_changed_topics!(mapping, old_topics, new_topics)
      update_log = []
      mapping.each do |old_topic_id, v|
        next if v['new_topic_id'].blank?

        old_integer_id = old_topic_id.match(/^OLD-(\d+)$/)[1].to_i
        new_integer_id = v['new_topic_id'].match(/^NEW-(\d+)$/)[1].to_i
        old_topic = old_topics[old_integer_id]
        new_topic = new_topics[new_integer_id]

        new_title_multiloc = v['adjusted_topic_title_multiloc'] || new_topic['title_multiloc']
        new_description_multiloc = v['adjusted_topic_description_multiloc'] || new_topic['description_multiloc']

        if old_topic.title_multiloc != new_title_multiloc || old_topic.description_multiloc != new_description_multiloc
          update_log << {
            topic_id: old_topic.id,
            title_multiloc: { old: old_topic.title_multiloc, new: new_title_multiloc },
            description_multiloc: { old: old_topic.description_multiloc, new: new_description_multiloc }
          }

          old_topic.update!(
            title_multiloc: v['adjusted_topic_title_multiloc'] || new_topic['title_multiloc'],
            description_multiloc: v['adjusted_topic_description_multiloc'] || new_topic['description_multiloc']
          )
        end
      end
      update_log
    end

    def create_new_topics!(mapping, new_topics)
      creation_log = []
      new_topics
        .filter { |new_topic| mapping.values.none? { |v| v['new_topic_id'] == "NEW-#{new_topics.index(new_topic)}" } }
        .each do |new_topic|
          Topic.transaction do
            topic = Topic.create!(
              title_multiloc: new_topic['title_multiloc'],
              description_multiloc: new_topic['description_multiloc']
            )
            ProjectsAllowedInputTopic.create!(
              project: @phase.project,
              topic:
            )
            SideFxTopicService.new.after_create(topic, nil)
            creation_log << {
              topic_id: topic.id,
              title_multiloc: new_topic['title_multiloc'],
              description_multiloc: new_topic['description_multiloc']
            }
          end
        end
      creation_log
    end

    def remove_obsolete_topics!(mapping, old_topics)
      removal_log = []
      obsolete_old_topic_ids = mapping
        .filter { |_, v| v['new_topic_id'].blank? }
        .keys
      obsolete_old_topic_ids.each do |old_topic_id|
        old_integer_id = old_topic_id.match(/^OLD-(\d+)$/)[1].to_i
        old_topic = old_topics[old_integer_id]
        Topic.transaction do
          IdeasTopic.where(topic: old_topic, idea: @phase.project.ideas.published).destroy_all
          ProjectsAllowedInputTopic.where(project: @phase.project, topic: old_topic).destroy_all
        end
        removal_log << {
          topic_id: old_topic.id
        }
      end
      removal_log
    end

    def project_description
      description_multiloc = if (layout = ContentBuilder::Layout.find_by(content_buildable: @phase.project, code: 'project_description', enabled: true))
        ContentBuilder::Craftjs::VisibleTextualMultilocs.new(layout.craftjs_json).extract_and_join
      else
        @phase.project.description_multiloc
      end
      multiloc_service.t(description_multiloc)
    end

    def log_topics_rebalanced_activity(update_log: [], creation_log: [], removal_log: [])
      LogActivityJob.perform_later(
        @phase,
        'topics_rebalanced',
        nil,
        Time.now.to_i,
        payload: {
          input_count: @phase.ideas.published.count,
          update_log:,
          creation_log:,
          removal_log:
        }
      )
    end
  end
end
