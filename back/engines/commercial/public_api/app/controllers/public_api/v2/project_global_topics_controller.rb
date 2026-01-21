# frozen_string_literal: true

module PublicApi
  class V2::ProjectGlobalTopicsController < PublicApiController
    def index
      project_global_topics = ProjectsGlobalTopic.where(query_filters)
      list_items(project_global_topics, V2::ProjectGlobalTopicSerializer)
    end

    private

    def query_filters
      params.permit(:project_id, :global_topic_id).to_h
    end
  end
end
