# frozen_string_literal: true

module Insights
  class CategoryImporter

    # @param view [Insights::View]
    # @param locale [String, NilClass]
    def import(view, locale = nil)
      import_categories(view, locale)
      import_category_assignments(view)
    end

    private

    # @param view [Insights::View]
    # @param locale [String, NilClass]
    # @return [Hash{Topic => Insights::Category}]
    def import_categories(view, locale)
      project_ids = view.data_sources.where(origin_type: 'Project').pluck(:origin_id)

      topics = Topic.joins(:projects_allowed_input_topics)
                    .where(projects_allowed_input_topics: { project_id: project_ids })
                    .distinct

      topics.index_with do |topic|
        Category.create!(
          name: category_name(topic, locale),
          view: view,
          source: topic
        )
      end
    end

    # @param view [Insights::View]
    # @return [Array<String>] the identifiers of the newly-created assignments
    def import_category_assignments(view)
      project_ids = view.data_sources.where(origin_type: 'Project').select(:origin_id)
      topic_category_mapping = view.categories.where(source_type: 'Topic')
                                   .index_by(&:source_id)

      ideas_topics = IdeasTopic.joins(:idea, :topic)
                               .where(ideas: { project_id: project_ids })
                               .where(topics: topic_category_mapping.keys)

      now = Time.zone.now
      assignment_attrs = ideas_topics.map do |idea_topic|
        {
          category_id: topic_category_mapping[idea_topic.topic_id].id,
          input_id: idea_topic.idea_id,
          input_type: 'Idea',
          approved: true,
          created_at: now,
          updated_at: now
        }
      end

      Insights::CategoryAssignmentsService.new.batch_create(assignment_attrs)
    end

    # @param topic [Topic]
    # @param locale [String, NilClass]
    def category_name(topic, locale)
      return topic.title_multiloc.first if locale.nil?

      topic.title_multiloc[locale] || topic.title_multiloc.first
    end
  end
end
