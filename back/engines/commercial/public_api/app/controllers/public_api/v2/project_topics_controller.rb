# frozen_string_literal: true

module PublicApi
  class V2::ProjectTopicsController < PublicApiController
    def index
      project_topics = ProjectsTopic.all
      list_items(project_topics, V2::ProjectTopicSerializer)
    end
  end
end
