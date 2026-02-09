module IdeaFeed
  # Service used by IdeaFeed (presentation_mode='feed') to automatically update
  # the Topics. The service is intended to be run periodically (e.g. every hour)
  # to keep the topics up to date with the latest ideas. It tries to strike a
  # balance between accuracy and stability of the clusters.
  class TopicModelingService
    def initialize(phase)
      @phase = phase
      @llm = LLMSelector.new.llm_class_for_use_case('idea_feed_live_topic_model').new
    end

    # `rebalance_topics!` is supposed to be called periodically (every day or
    # few days) to update the topics. It tries to keep the topics stable to some
    # extent, but also reshuffles them if needed.
    def rebalance_topics!
      # Only root topics participate in mapping - subtopics are always recreated
      old_root_topics = @phase.project.input_topics.roots.to_a

      # Run the topic model from scratch on the current set of inputs
      new_topics = run_topic_model

      # Build lookup hashes for prompt ID to object mapping
      old_topics_by_id = build_old_topic_index(old_root_topics)
      new_topics_by_id = build_new_topic_index(new_topics)

      # Compare the new topics with the existing topics to find matches
      if old_root_topics.any?
        mapping = run_map_old_to_new_topics(old_root_topics, new_topics)

        update_log = update_changed_topics!(mapping, old_topics_by_id, new_topics_by_id)
        creation_log = create_new_topics!(mapping, new_topics_by_id)
        removal_log = remove_obsolete_topics!(mapping, old_topics_by_id)
      else
        creation_log = create_new_topics!({}, new_topics_by_id)
      end

      log_topics_rebalanced_activity(update_log:, creation_log:, removal_log:)
    end

    private

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end

    def build_old_topic_index(old_topics)
      old_topics.each_with_index.to_h { |topic, i| ["OLD-#{i + 1}", topic] }
    end

    def build_new_topic_index(new_topics)
      new_topics.each_with_index.to_h { |topic, i| ["NEW-#{i + 1}", topic] }
    end

    def custom_fields_without_topics(form)
      form.custom_fields.reject { |f| f.key == 'topic_ids' }
    end

    def run_topic_model
      inputs = @phase.ideas.published

      prompt = topic_model_prompt(inputs)

      @llm.chat(prompt, response_schema: topic_model_response_schema)
    end

    def run_map_old_to_new_topics(old_topics, new_topics)
      prompt = topic_mapping_prompt(old_topics, new_topics)
      @llm.chat(prompt, response_schema: topic_mapping_response_schema(old_topics))
    end

    # Given the mapping, counts how many old topics map to the same new topic as the given old_topic_id
    def in_count(mapping, new_topic_id)
      mapping.values.count { |v| v['new_topic_id'] == new_topic_id }
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
            },
            icon: {
              type: 'string',
              description: 'An emoji representing the topic'
            },
            problems: {
              type: 'array',
              description: 'A list of mined problems or challenges that fall under this main topic.',
              items: {
                type: 'object',
                properties: {
                  title_multiloc: {
                    type: 'object',
                    description:
                    "The title of the problem in #{locales.join(', ')}. A very short problem statement.",
                    properties: locales.index_with { |locale| { type: 'string', description: "The title in #{locale}" } },
                    additionalProperties: false
                  },
                  description_multiloc: {
                    type: 'object',
                    description: "A short description of the problem in #{locales.join(', ')}. An open question that invites further exploration, without leading the respondent.",
                    properties: locales.index_with { |locale| { type: 'string', description: "The description in #{locale}" } },
                    additionalProperties: false
                  }
                },
                required: %w[title_multiloc description_multiloc]
              }
            }
          },
          required: %w[title_multiloc description_multiloc icon],
          additionalProperties: false
        }
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
          hash["OLD-#{i + 1}"] = {
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
                properties: locales.index_with { |locale| { type: 'string', description: "The description in #{locale}" } },
                additionalProperties: false
              }
            },
            required: %w[new_topic_id]
          }
        end
      }
    end

    def update_changed_topics!(mapping, old_topics_by_id, new_topics_by_id)
      update_log = []
      mapping.each do |old_topic_id, v|
        next if v['new_topic_id'].blank?
        # If multiple old topics map to the same new topic, we don't update them
        # (but we'll remove them later)
        next if in_count(mapping, v['new_topic_id']) != 1

        old_topic = old_topics_by_id[old_topic_id]
        new_topic = new_topics_by_id[v['new_topic_id']]

        new_title_multiloc = v['adjusted_topic_title_multiloc'] || new_topic['title_multiloc']
        new_description_multiloc = v['adjusted_topic_description_multiloc'] || new_topic['description_multiloc']

        InputTopic.transaction do
          if old_topic.title_multiloc != new_title_multiloc || old_topic.description_multiloc != new_description_multiloc
            update_log << {
              topic_id: old_topic.id,
              title_multiloc: { old: old_topic.title_multiloc, new: new_title_multiloc },
              description_multiloc: { old: old_topic.description_multiloc, new: new_description_multiloc }
            }

            old_topic.update!(
              title_multiloc: new_title_multiloc,
              description_multiloc: new_description_multiloc
            )
          end

          # Recreate subtopics from the new topic's problems
          old_topic.children.each do |child|
            frozen_record = child.destroy
            SideFxInputTopicService.new.after_destroy(frozen_record, nil)
          end

          (new_topic['problems'] || []).each do |subtopic|
            subtopic_record = InputTopic.create!(
              project: @phase.project,
              parent: old_topic,
              title_multiloc: subtopic['title_multiloc'],
              description_multiloc: subtopic['description_multiloc']
            )
            SideFxInputTopicService.new.after_create(subtopic_record, nil)
          end
        end
      end
      update_log
    end

    def create_new_topics!(mapping, new_topics_by_id)
      creation_log = []
      new_topics_by_id
        .reject { |new_topic_id, _| in_count(mapping, new_topic_id) == 1 }
        .each_value do |new_topic|
          InputTopic.transaction do
            topic = InputTopic.create!(
              project: @phase.project,
              title_multiloc: new_topic['title_multiloc'],
              description_multiloc: new_topic['description_multiloc'],
              icon: new_topic['icon']
            )

            SideFxInputTopicService.new.after_create(topic, nil)
            creation_log << {
              topic_id: topic.id,
              title_multiloc: new_topic['title_multiloc'],
              description_multiloc: new_topic['description_multiloc'],
              icon: new_topic['icon']
            }

            (new_topic['problems'] || []).each do |subtopic|
              subtopic_record = InputTopic.create!(
                project: @phase.project,
                parent: topic,
                title_multiloc: subtopic['title_multiloc'],
                description_multiloc: subtopic['description_multiloc']
              )
              SideFxInputTopicService.new.after_create(subtopic_record, nil)
              creation_log << {
                topic_id: subtopic_record.id,
                parent_id: topic.id,
                title_multiloc: subtopic['title_multiloc'],
                description_multiloc: subtopic['description_multiloc']
              }
            end
          end
        end
      creation_log
    end

    def remove_obsolete_topics!(mapping, old_topics_by_id)
      removal_log = []

      obsolete_old_topic_ids = mapping
        .filter { |_, v| v['new_topic_id'].blank? || in_count(mapping, v['new_topic_id']) != 1 }
        .keys
      obsolete_old_topic_ids.uniq.each do |old_topic_id|
        old_topic = old_topics_by_id[old_topic_id]
        # Destroying a root topic also destroys its children via dependent: :destroy
        old_topic.destroy!
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
