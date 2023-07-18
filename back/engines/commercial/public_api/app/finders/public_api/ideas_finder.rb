# frozen_string_literal: true

module PublicApi
  class IdeasFinder
    def initialize(scope, user_id: nil, project_id: nil, topic_ids: nil)
      @scope = scope
      @user_id = user_id
      @project_id = project_id
      @topic_ids = topic_ids
    end

    def execute
      @scope
        .then { |scope| filter_by_user_id(scope) }
        .then { |scope| filter_by_project_id(scope) }
        .then { |scope| filter_by_topic_ids(scope) }
    end

    private

    def filter_by_user_id(scope)
      return scope unless @user_id

      scope.where(author_id: @user_id)
    end

    def filter_by_project_id(scope)
      return scope unless @project_id

      scope.where(project_id: @project_id)
    end

    def filter_by_topic_ids(scope)
      return scope unless @topic_ids

      scope
        .joins(:idea_topics)
        .where(idea_topics: { topic_id: @topic_ids })
        .group(:id)
        .having('COUNT(idea_topics.topic_id) = ?', @topic_ids.size)
    end
  end
end
