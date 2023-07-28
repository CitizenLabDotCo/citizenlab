# frozen_string_literal: true

module PublicApi
  class IdeasFinder
    def initialize(scope, author_id: nil, project_id: nil, topic_ids: nil)
      @scope = scope
      @author_id = author_id
      @project_id = project_id
      @topic_ids = topic_ids
    end

    def execute
      @scope
        .then { |scope| filter_by_author_id(scope) }
        .then { |scope| filter_by_project_id(scope) }
        .then { |scope| filter_by_topic_ids(scope) }
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

    # Select only ideas that have all the topics
    def filter_by_topic_ids(scope)
      return scope unless @topic_ids

      scope
        .joins(:topics)
        .where(topics: { id: @topic_ids })
        .group('ideas.id')
        .having('COUNT(topics.id) = ?', @topic_ids.size)
    end
  end
end
