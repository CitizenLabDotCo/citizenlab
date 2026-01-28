# frozen_string_literal: true

module PublicApi
  class IdeasFinder
    def initialize(scope, author_id: nil, project_id: nil, topic_ids: nil, type: nil)
      @scope = scope
      @author_id = author_id
      @project_id = project_id
      @topic_ids = topic_ids
      @type = type
    end

    def execute
      @scope
        .then { |scope| filter_by_author_id(scope) }
        .then { |scope| filter_by_project_id(scope) }
        .then { |scope| filter_by_topic_ids(scope) }
        .then { |scope| filter_by_type(scope) }
    end

    private

    def filter_by_author_id(scope)
      return scope unless @author_id

      scope.where(author_id: @author_id)
    end

    def filter_by_project_id(scope)
      return scope unless @project_id

      scope.where(project_id: @project_id)
    end

    # Select only ideas that have all the input topics (including children)
    # For each requested topic, the idea must have that topic OR any of its children
    def filter_by_topic_ids(scope)
      return scope unless @topic_ids

      @topic_ids.each do |topic_id|
        topic_with_children_ids = InputTopic.where(id: topic_id)
          .or(InputTopic.where(parent_id: topic_id))
          .pluck(:id)

        scope = scope.where(
          'EXISTS (SELECT 1 FROM ideas_input_topics WHERE ideas_input_topics.idea_id = ideas.id AND ideas_input_topics.input_topic_id IN (?))',
          topic_with_children_ids
        )
      end

      scope
    end

    def filter_by_type(scope)
      return scope unless @type

      if @type == 'survey'
        scope.native_survey
      elsif @type == 'idea'
        scope.transitive
      else
        scope
      end
    end
  end
end
