# frozen_string_literal: true

module PublicApi
  class V2::ProjectTopicsController < PublicApiController
    def index
      project_topics = ProjectsGlobalTopic.where(query_filters)
      list_items(project_topics, V2::ProjectTopicSerializer)
    end

    private

    def query_filters
      params.permit(:project_id, :global_topic_id).to_h
    end
  end
end
