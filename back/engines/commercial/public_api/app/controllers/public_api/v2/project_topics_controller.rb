# frozen_string_literal: true

module PublicApi
  class V2::ProjectTopicsController < PublicApiController
    def index
      project_topics = ProjectsGlobalTopic.where(query_filters)
      list_items(project_topics, V2::ProjectTopicSerializer)
    end

    private

    def query_filters
      filters = params.permit(:project_id, :topic_id).to_h
      if filters[:topic_id]
        filters[:global_topic_id] = filters.delete(:topic_id)
      end
      filters
    end
  end
end
